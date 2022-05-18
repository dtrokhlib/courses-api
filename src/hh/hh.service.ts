import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs';
import { HhData } from 'src/top-page/top-page.model';
import { API_URL, CLUSTER_FIND_ERROR, SALARY_CLUSTER_ID } from './hh.constants';
import { HhResponse } from './hh.models';

@Injectable()
export class HhService {
    token: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.token = this.configService.get('API_TOKEN') ?? '';
    }

    async getData(text: string) {
        try {
            const data = await this.getHhData(text)

            return this.parseData(data);
        } catch (e) {
            Logger.error(e);
        }
    }

    private parseData(data: any): HhData {
        const salaryCluser = data.clusters.find(
            (c) => c.id == SALARY_CLUSTER_ID,
        );
        if (!salaryCluser) {
            throw new Error(CLUSTER_FIND_ERROR);
        }
        const juniorSalary = this.getSalaryFromString(
            salaryCluser.items[1].name,
        );
        const middleSalary = this.getSalaryFromString(
            salaryCluser.items[Math.ceil(salaryCluser.items.length / 2)].name,
        );
        const seniorSalary = this.getSalaryFromString(
            salaryCluser.items[salaryCluser.items.length - 1].name,
        );
        return {
            count: data.found,
            juniorSalary,
            middleSalary,
            seniorSalary,
            updatedAt: new Date(),
        };
    }

    private getSalaryFromString(s: string): number {
        const numberRegExp = /(\d+)/g;
        const res = s.match(numberRegExp);
        if (!res) {
            return 0;
        }
        return Number(res[0]);
    }

    private getHhData(text: string) {
        return this.httpService
                .get(API_URL.vacancies, {
                    params: {
                        text,
                        clusters: true,
                    },
                    headers: {
                        'User-Agent': 'http://test.com',
                        Authorization: `Bearer ${this.token}`,
                    },
                })
                .pipe(map((response) => response.data));
    }
}
