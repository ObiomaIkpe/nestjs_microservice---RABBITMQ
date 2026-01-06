import { Controller, Get, Inject } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, of, timeout } from 'rxjs';

@Controller()
export class GatewayController {
  constructor(
    @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy,
      @Inject('SEARCH_CLIENT') private readonly searchClient: ClientProxy,
          @Inject('MEDIA_CLIENT') private readonly mediaClient: ClientProxy,
  ) {}

  @Get('health')
  async health() {
    const ping = async (serviceName: string, client: ClientProxy) => {
  try {
    const result = await firstValueFrom(
      client.send('service.ping', { from: 'gateway' }).pipe(
        timeout(2000),
      ),
    );

    return {
      ok: true,
      service: serviceName,
      result,
    };
  } catch (error) {
    return {
      ok: false,
      service: serviceName,
      error: error?.message ?? 'timeout',
    };
  }
};


    const [catalog, media, search] = await Promise.all([
      ping('catalog', this.catalogClient),
      ping('media', this.mediaClient),
      ping('search', this.searchClient)
    ])
    const ok = [catalog, media, search].every((s) => s.ok)
    return {
      ok, gateway: {service: 'gateway', now: new Date().toDateString}, services: {
        catalog, media, search
      }
    }
  }
}
