#  (c) 2023 Alberto Marchetti (info@cmaster11.me)
#  GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)

import json
import os.path
import logging, re
from pathlib import Path

from mkdocs.plugins import event_priority

# try:
# except ImportError:
#     event_priority = lambda priority: lambda f: f  # No-op fallback

log = logging.getLogger('mkdocs')


def load_code_block(visited_types, is_root, base_path, type_name, code_path_explicit):
    runtime_vars = {
        'annotation_counter': 1
    }
    if visited_types is None:
        visited_types = []

    code_path = os.path.join(base_path, 'schema.gen.ts') if code_path_explicit is None else os.path.join(base_path,
                                                                                                         code_path_explicit)
    with open(code_path, 'r') as content_file:
        content = content_file.read()
    # Find the matching block
    regex_code_block = re.compile(
        r'^\s*// \[block ' + re.escape(type_name) + r' begin](.+)^\s*// \[block ' + re.escape(type_name) + r' end]',
        re.DOTALL | re.MULTILINE)
    m_code = re.search(regex_code_block, content)
    if m_code is None:
        log.error(f'No code block found for {type_name} in {code_path}')
        return '!!! failure' + '\n\n' + f'    No code block found for {type_name} in {code_path}'
    regex_type_meta = re.compile(r'^//meta:' + re.escape(type_name) + r':(.+)$', re.MULTILINE)
    m_content_meta = re.search(regex_type_meta, content)
    m_meta = []
    if m_content_meta is not None:
        m_meta = json.loads(m_content_meta.group(1))
        # Reverse so that metas priority is correct
        m_meta.reverse()

    def find_meta(key):
        for meta in m_meta:
            if key in meta:
                return meta[key]
        return None

    code_to_embed = m_code.group(1).strip()

    # Extract all type references from the code to embed, and also load them
    annotations_list = []

    # Loads first the self ones, which are types in the same schema gen
    types_to_load_self = []
    types_to_load = []

    annotation_ref_tmp = 'ANNOTATION_REF_TMP:'

    def types_to_load_lambda(match_type_ref):
        m_comment_prefix = match_type_ref.group(1)
        m_type_name = match_type_ref.group(2)
        m_type_meta = json.loads(match_type_ref.group(3))

        import_path = m_type_meta['relPath']
        is_registry_export = m_type_meta.get('isRegistryExport', None) is True

        is_self = import_path == 'self'
        if is_self:
            import_path = code_path
        annotation_idx = runtime_vars['annotation_counter']
        runtime_vars['annotation_counter'] = annotation_idx + 1
        if is_self:
            types_to_load_self.append([m_type_name, import_path, is_registry_export, annotation_idx])
        else:
            types_to_load.append([m_type_name, import_path, is_registry_export, annotation_idx])
        if m_comment_prefix == '##':
            return f'{annotation_ref_tmp}({annotation_idx})'
        return f'{annotation_ref_tmp} // ({annotation_idx})!'

    # Strip away all typeRef comments, and gather info on other types to load
    code_to_embed = re.sub(
        re.compile(
            r'\s*(//|##)\s*typeRef:([^:]+):(.+)$', re.MULTILINE
        ),
        types_to_load_lambda,
        code_to_embed,
    )

    sorted_annotations_ref = {'index': 1}
    sorted_annotations_obj = {}
    # Resort annotations by priority
    for loop_type_name, loop_import_path, loop_is_registry_export, loop_annotation_idx in [*types_to_load_self,
                                                                                           *types_to_load]:
        new_idx = sorted_annotations_ref['index']
        sorted_annotations_ref['index'] = new_idx + 1
        sorted_annotations_obj[f'{loop_annotation_idx}'] = new_idx

    # Sort annotations indexes
    code_to_embed = re.sub(
        re.compile(
            annotation_ref_tmp + r'( // |)\((\d+)\)(!|)$', re.MULTILINE
        ),
        lambda m: f'{m.group(1)}({sorted_annotations_obj[m.group(2)]}){m.group(3)}',
        code_to_embed,
    )

    docs_to_append = []

    for loop_type_name, loop_import_path, loop_is_registry_export, loop_annotation_idx in [*types_to_load_self,
                                                                                           *types_to_load]:
        # typeRefs are defined from the current code page, so from the resolved code_path dir
        code_path_dir = os.path.dirname(code_path)
        loop_import_path_resolved = os.path.join(code_path_dir, loop_import_path)
        loop_import_path_dir = os.path.dirname(loop_import_path_resolved)
        loop_import_path_file = os.path.basename(loop_import_path)

        sorted_annotation_index = sorted_annotations_obj[f'{loop_annotation_idx}']
        # Check if the import path is the main export of a registry entry, in which case link
        # to it but do not import the whole chain
        if loop_is_registry_export:
            loop_registry_folder = os.path.basename(Path(loop_import_path_dir, '..').resolve())
            loop_registry_entry = os.path.basename(loop_import_path_dir)
            href = f'/{loop_registry_folder}/{loop_registry_entry}#{loop_type_name.lower()}'
            annotations_list.append(
                f'{sorted_annotation_index}. [See the definition of `{loop_type_name}`]({href})')
            continue

        log.info(f'importing {loop_type_name} from {loop_import_path_dir} with file {loop_import_path_file}')
        # log.info(f'Context: code_path_dir={code_path_dir},loop_import_path={loop_import_path}')
        annotations_list.append(
            f'{sorted_annotation_index}. [See the definition of `{loop_type_name}`](#{loop_type_name.lower()})')

        # Check if the type has been visited in a parent or sibling loop
        loop_type_already_loaded = next((x for x in visited_types if x == loop_type_name), None)
        if loop_type_already_loaded is None:
            visited_types.append(loop_type_name)
            docs_to_append.append(
                load_code_block(visited_types, False, loop_import_path_dir, loop_type_name, loop_import_path_file))

    def links_lambda(match):
        m_comment_prefix = match.group(1)
        m_link_text = match.group(2)
        m_url = match.group(3)
        annotation_idx = runtime_vars['annotation_counter']
        runtime_vars['annotation_counter'] = annotation_idx + 1
        annotations_list.append(
            f'{annotation_idx}. [{m_link_text}]({m_url})')
        if m_comment_prefix == '##':
            return f'({annotation_idx})'
        return f' // ({annotation_idx})!'

    # Replace all hard links
    code_to_embed = re.sub(
        re.compile(
            r'\s*(//|##)\s*link#([^#]+)#(.*)$', re.MULTILINE
        ),
        links_lambda,
        code_to_embed,
    )

    flags = {
        'disable_shortie': find_meta('disableShortie') is True
    }

    # Fix all trailing JsDoc empty lines
    code_to_embed = re.sub(
        re.compile(
            r'( \*\n)+ \*/', re.MULTILINE
        ),
        ' */',
        code_to_embed,
    )

    docs_blocks = []

    if flags['disable_shortie']:
        docs_blocks.extend([
            f'!!! note',
            '',
            f'    This module does not support using the shortie annotation.'
        ])

    docs_blocks.extend([
        # f'#### `{type_name}`',
        f'```ts title="{type_name}"',
        code_to_embed,
        '```',
        '{: #' + type_name.lower() + '}',
        ''
    ])

    if len(annotations_list) > 0:
        docs_blocks.append('')
        docs_blocks.extend(annotations_list)
        docs_blocks.append('')

    if len(docs_to_append) > 0:
        if is_root:
            docs_blocks.append('')
            docs_blocks.append('###### Referenced types')
            docs_blocks.append('')
        docs_blocks.extend(docs_to_append)

    return '\n'.join(docs_blocks)


def embed_code(page, match):
    path = os.path.dirname(page.file.abs_src_path)
    file_name = match.group(1)
    code_path = os.path.join(path, file_name)
    with open(code_path, 'r') as content_file:
        content = content_file.read()

    return '```' + os.path.splitext(file_name)[1] + f' title="{file_name}"' + '\n' + content.strip() + '\n' + '```'


# Produces a table of all available builtin modules
def list_modules(page, match):
    path = os.path.dirname(page.file.abs_src_path)

    lines = []

    sub_dirs = os.listdir(path)
    for sub_dir in sub_dirs:
        if sub_dir.startswith('_'):
            continue
        sub_path = os.path.join(path, sub_dir)
        if not os.path.isdir(sub_path):
            continue
        # Read README, strip the title and use the first sentence as summary
        readme_path = os.path.join(sub_path, "README.md")
        if not os.path.exists(readme_path):
            lines.append([f"`{sub_dir}`", "", "❌"])
            continue

        module_link = f'[`{sub_dir}`](./{sub_dir})'

        with open(readme_path, 'r') as content_file:
            readme_lines = content_file.readlines()

        summary = ''
        for line in readme_lines:
            if line.startswith('#'):
                if summary != '':
                    break
                continue
            if line.strip() == '':
                if summary != '':
                    break
                continue
            summary += line.strip() + ' '
        lines.append([module_link, summary.strip(), "✅"])

    table = ('| Module | Description | Docs available |\n' +
             '| --- | --- | --- |\n' +
             '\n'.join(map(lambda line: '| ' + ' | '.join(line) + ' |', lines)))

    return table


@event_priority(9999)
def on_page_read_source(page, **kwargs):
    with open(page.file.abs_src_path, 'r') as content_file:
        src = content_file.read()

    src = re.sub(
        re.compile(
            r'^!\[embed ([^]]+)]$',
            re.MULTILINE,
        ),
        lambda match: embed_code(page, match),
        src,
    )

    src = re.sub(
        re.compile(
            r'^!\[type ([^] ]+)(?: ([^] ]+))?]$',
            re.MULTILINE,
        ),
        lambda match: load_code_block(None, True, os.path.dirname(page.file.abs_src_path), match.group(1),
                                      match.group(2)),
        src,
    )

    src = re.sub(
        re.compile(
            r'^!\[listModules]$',
            re.MULTILINE,
        ),
        lambda match: list_modules(page, match),
        src,
    )

    return src
