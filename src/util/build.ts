export const version10InfraConfig: string = '[VI]{{version}}[/VI]';
export const isPartOfESBuildBundleValue = '[VI]{{isPartOfESBundle}}[/VI]';
export const isPartOfESBuildBundle = (() => isPartOfESBuildBundleValue)() == 'true';
