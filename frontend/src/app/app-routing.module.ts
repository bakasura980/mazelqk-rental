import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dao/Inbox',
    pathMatch: 'full',
  },
  {
    path: 'dao/list',
    loadChildren: () =>
      import('./dao-list/dao-list').then((m) => m.DaoListPageModule),
  },
  {
    path: 'dao/add',
    loadChildren: () =>
      import('./dao-add/dao-add').then((m) => m.DaoAddPageModule),
  },
  {
    path: 'dao/eval',
    loadChildren: () =>
      import('./dao-eval/dao-eval').then((m) => m.DaoEvalPageModule),
  },
  {
    path: 'dao/earn',
    loadChildren: () =>
      import('./dao-earn/dao-earn').then((m) => m.DaoEarnPageModule),
  },

  {
    path: 'owners/rewards',
    loadChildren: () =>
      import('./owners-rewards/owners-rewards').then(
        (m) => m.OwnersRewardsPageModule
      ),
  },

  {
    path: 'renters/list',
    loadChildren: () =>
      import('./renters-list/renters-list').then(
        (m) => m.RentersListPageModule
      ),
  },
  {
    path: 'renters/profile',
    loadChildren: () =>
      import('./renters-profile/renters-profile').then(
        (m) => m.RentersProfilePageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
