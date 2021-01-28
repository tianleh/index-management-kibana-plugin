/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { resolve } from "path";
import { existsSync } from "fs";

import { createISMCluster } from "./server/clusters";
import { PolicyService, ManagedIndexService, IndexService } from "./server/services";
import { indices, policies, managedIndices } from "./server/routes";
import { DEFAULT_APP_CATEGORIES } from "../../src/core/utils";

// likely imported from another file
function search(server, request) {
  const { elasticsearch } = server.plugins;
  return elasticsearch.getCluster("admin").callWithRequest(request, "search");
}

export default function (kibana) {
  const print = function () {
    console.log("hello from ISM");
  };

  return new kibana.Plugin({
    require: ["elasticsearch"],
    name: "opendistro_index_management_kibana",
    uiExports: {
      app: {
        title: "Index Management",
        description: "Kibana plugin for Index Management",
        main: "plugins/opendistro_index_management_kibana/app",
        category: DEFAULT_APP_CATEGORIES.management,
      },
      hacks: [],
      styleSheetPaths: [resolve(__dirname, "public/app.scss"), resolve(__dirname, "public/app.css")].find((p) => existsSync(p)),
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server, options) {
      // Create clusters
      createISMCluster(server);

      // Initialize services
      const esDriver = server.plugins.elasticsearch;
      const indexService = new IndexService(esDriver);
      const policyService = new PolicyService(esDriver);
      const managedIndexService = new ManagedIndexService(esDriver);
      const services = { indexService, policyService, managedIndexService };

      // Add server routes
      indices(server, services);
      policies(server, services);
      managedIndices(server, services);

      server.route({
        path: "/api/demo_plugin/search",
        method: "POST",
        async handler(request) {
          search(server, request); // target acquired
        },
      });

      server.expose("getDemoBar", () => {
        return `Demo ${server.plugins.foo.getBar()}`;
      });

      // const myPlugin = server.newPlatform.setup.plugins.opendistroSecurity;
      // if (!myPlugin) {
      //   throw new Error('myPlugin plugin is not available.');
      // }
      //
      // console.log('myPlugin is ' + Object.keys(myPlugin) + ' print is ' + print);
      //
      // myPlugin.registerLegacyAPI(print);
      //
      // console.log('successfully call register');
    },
  });
}
