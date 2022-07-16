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
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
