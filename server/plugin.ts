// server/plugin.ts
import { CoreSetup, Plugin } from "src/core/server";
import { ElasticsearchPlugin } from "../elasticsearch";
import { Legacy } from "kibana";
import { PluginsSetup } from "ui/new_platform/new_platform";

interface FooSetup {
  getBar(): string;
}

// We inject the miminal legacy dependencies into our plugin including dependencies on other legacy
// plugins. Take care to only expose the legacy functionality you need e.g. don't inject the whole
// `Legacy.Server` if you only depend on `Legacy.Server['route']`.
interface LegacySetup {
  route: Legacy.Server["route"];
  plugins: {
    elasticsearch: ElasticsearchPlugin; // note: Elasticsearch is in CoreSetup in NP, rather than a plugin
    foo: FooSetup;
  };
}

// Define the public API's for our plugins setup and start lifecycle
export interface DemoSetup {
  getDemoBar: () => string;
}
export interface DemoStart {}

// Once we start dependending on NP plugins' setup or start API's we'll add their types here
export interface DemoSetupDeps {}
export interface DemoStartDeps {}

export class DemoPlugin implements Plugin<DemoSetup, DemoStart, DemoSetupDeps, DemoStartDeps> {
  public setup(core: CoreSetup, plugins: PluginsSetup, __LEGACY: LegacySetup): DemoSetup {
    // We're still using the legacy Elasticsearch and http router here, but we're now accessing
    // these services in the same way a NP plugin would: injected into the setup function. It's
    // also obvious that these dependencies needs to be removed by migrating over to the New
    // Platform services exposed through core.
    // const serverFacade: ServerFacade = {
    //   plugins: {
    //     elasticsearch: __LEGACY.plugins.elasticsearch,
    //   },
    // };

    __LEGACY.route({
      path: "/api/demo_plugin/search",
      method: "POST",
      async handler(request) {
        console.log("dummy call");
        // const requestFacade: RequestFacade = {
        //   headers: request.headers,
        // };
        // search(serverFacade, requestFacade);
      },
    });

    // Exposing functionality for other plugins
    return {
      getDemoBar() {
        return `Demo ${__LEGACY.plugins.foo.getBar()}`; // Accessing functionality from another legacy plugin
      },
    };
  }
}
