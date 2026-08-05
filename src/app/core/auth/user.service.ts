import { Injectable } from '@angular/core';
import { User } from './models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly USER_KEY = 'data_user';

  get(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    if(!user){
        return null
    }
    return JSON.parse(user);
  }

  set(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    localStorage.removeItem(this.USER_KEY);
  }
}
