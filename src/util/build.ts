/*
 * (c) 2023 Alberto Marchetti (info@cmaster11.me)
 * GNU General Public License v3.0+ (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

export const version10InfraConfig = '[VI]{{version10Infra}}[/VI]';
export const versionESBuild = '[VI]{{versionESBuild}}[/VI]';
export const isPartOfESBuildBundleValue = '[VI]{{isPartOfESBundle}}[/VI]';
export const isPartOfESBuildBundle = (() => isPartOfESBuildBundleValue)() == 'true';
