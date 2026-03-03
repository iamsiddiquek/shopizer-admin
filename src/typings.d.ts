/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

/* SystemJS module definition */
declare const module: NodeModule;
interface NodeModule {
  id: string;
}

declare const tinymce: any;
declare const echarts: any;

declare const $ENV: Env;
interface Env {
  googleApiKey: string;
  mode: string;
  apiUrl: string;
  client: any;
}
