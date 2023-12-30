# `copy`

You can use the `copy` module to copy files using glob paths and e.g. optionally process any templates they contain.

## Usage

![embed examples/glob.yaml]
![embed examples/singleFile.yaml]

### Templates

You can use the `copy` module to batch process files containing templates. By configuring the `template` argument
accordingly, you can make it so that every copied file is treated as a template file, and the copy destination will
contain the rendered templates.

![embed examples/globTemplate.yaml]
![embed examples/singleFileTemplate.yaml]

## Reference

Key: `copy`

![type ModuleCopyInterface]
