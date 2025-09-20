import { Injectable } from '@angular/core';
import { CanMatchFn, Router, UrlSegment, Route } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';

export const adminGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.loggedInUser;

  if (user && user.role === 'admin') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
