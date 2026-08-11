import { Environment } from "../app/core/models/environment.model";

export const environment : Environment = {
    production: false,
    apiUrl: 'https://curvature-unblessed-elm.ngrok-free.dev/api',
    appVersion: '1.0.0-qa',
    enableLogging: true,
}