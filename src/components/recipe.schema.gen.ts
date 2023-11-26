// Generated with: yarn gen -> cmd/schemaGen.ts

import { RecipeSourceListInterface } from '../recipeSources/recipeSourceList.schema.gen';
/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

import { VarsInterface } from './varsContainer.schema.gen';
import { TaskForArchiveInterface, TaskInterface } from './task.schema.gen';
import { TestMockInterface } from './testing.schema.gen';

export interface HostVarsBlockInterface {
  groupVars?: {
    [x: string]: VarsInterface;
  };
  hostVars?: {
    [x: string]: VarsInterface;
  };
}

export interface RecipeAsDependencyInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface;
  };
  groupVars?: {
    [x: string]: VarsInterface;
  };
  hostVars?: {
    [x: string]: VarsInterface;
  };
  inputs?: RecipeInputsInterface;
  tasks: TaskForArchiveInterface[];
  vars?: VarsInterface;
}

export interface RecipeDependencyInterface {
  sourceId?: string;
  version?: string;
}

export type RecipeDependencyWithAlternativesInterface = string | null | RecipeDependencyInterface;

export interface RecipeForArchiveInterface {
  config: RecipeAsDependencyInterface;
  otherHosts?: RecipeTargetsInterface;
  targets?: RecipeTargetsInterface;
}

export interface RecipeInputsInterface {
  [x: string]: 'alternatives' | 'any' | 'array' | 'boolean' | 'date' | 'function' | 'link' | 'number' | 'object' | 'string' | 'symbol' | 'binary' | 'alt' | 'bool' | 'func' | any;
}

export interface RecipeInterface {
  dependencies?: {
    [x: string]: RecipeDependencyWithAlternativesInterface;
  };
  groupVars?: {
    [x: string]: VarsInterface;
  };
  hostVars?: {
    [x: string]: VarsInterface;
  };
  ignoreContextSources?: boolean;
  inputs?: RecipeInputsInterface;
  mocks?: TestMockInterface[];
  otherHosts?: RecipeTargetsInterface;
  recipeSources?: RecipeSourceListInterface;
  targets?: RecipeTargetsInterface;
  tasks: TaskInterface[];
  vars?: VarsInterface;
}

export type RecipeTargetsInterface = string[];
