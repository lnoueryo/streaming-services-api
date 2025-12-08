import { HttpService } from '@nestjs/axios';
import { Provider } from '@nestjs/common';
import { AxiosFactory } from '../plugins/axios';
import config from 'src/config';

export const SignalingHttpClient: Provider = {
  provide: 'SIGNALING_HTTP_CLIENT',
  useFactory: () => {
    const axios = AxiosFactory.create({
      baseURL: config.signalingApiOrigin,
      validateStatus: (_) => true
    })
    return new HttpService(axios);
  },
};