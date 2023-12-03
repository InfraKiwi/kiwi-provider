import os.path
import logging, re
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

    code_to_embed = m_code.group(1).strip()

    # Extract all type references from the code to embed, and also load them
    types_to_load = []

    def types_to_load_lambda(match_type_ref):
        m_type_name = match_type_ref.group(1)
        m_import_path = match_type_ref.group(2)
        m_is_main_export = match_type_ref.group(3) == 'true'
        # If already found, skip
        m_existing_el = next((x for x in types_to_load if x[0] == m_type_name), None)
        if m_existing_el is not None:
            return f' // ({m_existing_el[3]})!'
        m_annotation_idx = runtime_vars['annotation_counter']
        runtime_vars['annotation_counter'] = m_annotation_idx + 1
        types_to_load.append([m_type_name, m_import_path, m_is_main_export, m_annotation_idx])
        return f' // ({m_annotation_idx})!'

    # Strip away all typeRef comments, and gather info on other types to load
    code_to_embed = re.sub(
        re.compile(
            r'\s*//\s*typeRef:([^:]+):(.+):(true|false)$', re.MULTILINE
        ),
        types_to_load_lambda,
        code_to_embed,
    )

    flags = {
        'disable_shortie': False
    }

    # Process all examples used as flags
    def process_examples_as_flags(match):
        flag_name = match.group(1)
        flag_value = match.group(2) == 'true'
        if flag_name == 'disableShortie' and flag_value:
            flags['disable_shortie'] = True
        return ''

    code_to_embed = re.sub(
        re.compile(
            r' \* @example //(\w+):(true|false)$\n', re.MULTILINE
        ),
        process_examples_as_flags,
        code_to_embed,
    )

    # Fix all trailing JsDoc empty lines
    code_to_embed = re.sub(
        re.compile(
            r'( \*\n)+ \*/', re.MULTILINE
        ),
        ' */',
        code_to_embed,
    )

    docs_to_append = []
    annotations_list = []

    for loop_type_name, loop_import_path, loop_is_main_export, annotation_idx in types_to_load:
        # typeRefs are defined from the current code page, so from the resolved code_path dir
        code_path_dir = os.path.dirname(code_path)
        loop_import_path_dir = os.path.dirname(os.path.join(code_path_dir, loop_import_path))
        loop_import_path_file = os.path.basename(loop_import_path)
        # Check if the import path is the main export of a registry entry, in which case link
        # to it but do not import the whole chain
        if loop_is_main_export:
            loop_link_to = os.path.dirname(loop_import_path)
            annotations_list.append(
                f'{annotation_idx}. [See definition of `{loop_type_name}`](/{loop_link_to})')
            continue

        log.info(f'importing {loop_type_name} from {loop_import_path_dir} with file {loop_import_path_file}')
        # log.info(f'Context: code_path_dir={code_path_dir},loop_import_path={loop_import_path}')
        annotations_list.append(f'{annotation_idx}. [See definition of `{loop_type_name}`](#{loop_type_name.lower()})')

        # Check if the type has been visited in a parent or sibling loop
        loop_type_already_loaded = next((x for x in visited_types if x == loop_type_name), None)
        if loop_type_already_loaded is None:
            visited_types.append(loop_type_name)
            docs_to_append.append(
                load_code_block(visited_types, False, loop_import_path_dir, loop_type_name, loop_import_path_file))

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
        module_name_md = f'[{sub_dir}](./{sub_dir})'
        sub_path = os.path.join(path, sub_dir)
        if not os.path.isdir(sub_path):
            continue
        # Read README, strip the title and use the first sentence as summary
        readme_path = os.path.join(sub_path, "README.md")
        if not os.path.exists(readme_path):
            lines.append([module_name_md, ""])
            continue

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
        lines.append([module_name_md, summary.strip()])

    table = ('| Module | Description |\n' +
             '| --- | --- |\n' +
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
