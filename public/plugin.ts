import { CoreSetup, CoreStart, Plugin } from "kibana/server";
import { FooSetup, FooStart } from "../../../../legacy/core_plugins/foo/public";

/**
 * These are the private interfaces for the services your plugin depends on.
 * @internal
 */
export interface DemoSetupDeps {
  foo: FooSetup;
}
export interface DemoStartDeps {
  foo: FooStart;
}

/**
 * These are the interfaces with your public contracts. You should export these
 * for other plugins to use in _their_ `SetupDeps`/`StartDeps` interfaces.
 * @public
 */
export type DemoSetup = {};
export type DemoStart = {};

/** @internal */
export class DemoPlugin implements Plugin<DemoSetup, DemoStart, DemoSetupDeps, DemoStartDeps> {
  public setup(core: CoreSetup, plugins: DemoSetupDeps): DemoSetup {
    // kick off your plugin here...
    return {
      fetchConfig: () => ({}),
    };
  }

  public start(core: CoreStart, plugins: DemoStartDeps): DemoStart {
    // ...or here
    return {
      initDemo: () => ({}),
    };
  }

  public stop() {}
}
