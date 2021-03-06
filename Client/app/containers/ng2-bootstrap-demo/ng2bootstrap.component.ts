﻿import { Component } from '@angular/core';

@Component({
    selector: 'app-bootstrap',
    templateUrl: './ng2bootstrap.component.html'
})
export class Ng2BootstrapComponent {

    public oneAtATime: boolean = true;
    public items: Array<string> = ['Item 1', 'Item 2', 'Item 3'];

    public status: Object = {
        isFirstOpen: true,
        isFirstDisabled: false
    };

    public groups: Array<any> = [
        {
            title: 'Angular is neato gang!',
            content: 'ASP.NET Core is too :)'
        },
        {
            title: 'Another One!',
            content: 'Some content going here'
        }
    ];

    // Use "constructor"s only for dependency injection
    constructor() { }

    addItem(): void {
        this.items.push(`Items ${this.items.length + 1}`);
    }

}