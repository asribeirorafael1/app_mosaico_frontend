import { environment } from './../../../../environments/environment';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})

export class NavBarComponent implements OnInit{

  @Output() menuToggle: EventEmitter<boolean> = new EventEmitter()
  @Input() opened = false;
  @Input() listMenu = new Array<any>();
  @Output() activeEmitter: EventEmitter<any> = new EventEmitter();
  constructor(
  ){ }

  ngOnInit(): void {

  }

  toggle() {
    this.opened = !this.opened;
    this.menuToggle.emit(this.opened);
  }

  clickLink(item: any) {

    this.listMenu.forEach(itemMenu => {
      if(itemMenu.title === item.title)
        itemMenu.isActive = true;
      else
        itemMenu.isActive = false;
    });

    this.activeEmitter.emit(this.listMenu);

  }

  signOut(){
    localStorage.removeItem("token");
    location.href = environment.site;
  }

}
