import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  listMenu = [{
    title: "Início",
    isActive: true,
    link: "/"
  },{
    title: "Meus Mosaicos",
    isActive: false,
    link: "/mosaicos"
  }]

  ngOnInit(): void {
  }

  menuOpened = false;

  setMenuState(state: boolean) {
    this.menuOpened = state;
  }

  closeMenu(){
    this.menuOpened = false;
  }

}
