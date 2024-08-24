export class User {
    id: number = 0;
    username: string = "";
    password: string = "";
    firstName: string = "";
    lastName: string = "";
    token: string = "";
    sessionId: string = "";
    account: string = "";
    selected: boolean = false;

    User(sessionId: string, account: string, token: string)
    {
        this.sessionId = sessionId;
        this.account = account;
        this.token = token;
        this.selected = false;
    }
}
