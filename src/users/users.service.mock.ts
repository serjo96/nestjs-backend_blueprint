export class UsersServiceMock {
  findAll(where: any): any[] {
    return [];
  }

  findOne(where: any): any {
    return {
      id: 1,
      email: 'test@admin.com',
    };
  }

  create({ email }: { email: string }): any {
    return {
      id: 1,
      email,
    };
  }
}
