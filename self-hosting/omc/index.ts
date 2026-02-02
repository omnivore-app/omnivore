#!/usr/bin/env node
/**
 * OMC Main CLI Entry Point
 * AIDEV-NOTE: OCLIF CLI runner for OMC commands
 */

import { run } from '@oclif/core';

await run(process.argv.slice(2), import.meta.url);
