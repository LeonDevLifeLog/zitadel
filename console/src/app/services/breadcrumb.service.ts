import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { ManagementService } from './mgmt.service';

export enum BreadcrumbType {
  IAM,
  PROJECT,
  GRANTEDPROJECT,
  PROJECTGRANT,
  APP,
  IDP,
}

export class Breadcrumb {
  type: BreadcrumbType = BreadcrumbType.PROJECT;
  name: string = '';
  param: {
    key: 'projectid' | 'appid' | 'grantid' | 'id';
    value: string;
  } = {
    key: 'projectid',
    value: '',
  };
  routerLink: any[] = [];
  isZitadel?: boolean = false;

  constructor(init: Partial<Breadcrumb>) {
    Object.assign(this, init);
  }
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  public readonly breadcrumbs$: BehaviorSubject<Breadcrumb[]> = new BehaviorSubject<Breadcrumb[]>([]);
  public readonly breadcrumbsExtended$ = combineLatest([this.breadcrumbs$, this.mgmtService.ownedProjects]).pipe(
    map(([breadcrumbs, projects]) => {
      const newValues = breadcrumbs.map((b) => {
        if (!b.name && b.type === BreadcrumbType.PROJECT) {
          const project = projects.find((project) => project.id === b.param.value);
          b.name = project?.name ?? '';
          return b;
        } else {
          return b;
        }
      });
      return newValues;
    }),
  );

  constructor(private mgmtService: ManagementService) {}

  public setBreadcrumb(breadcrumbs: Breadcrumb[]) {
    this.breadcrumbs$.next(breadcrumbs);
  }
}