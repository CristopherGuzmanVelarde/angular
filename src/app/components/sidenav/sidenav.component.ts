import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  expanded = true;

  constructor(private renderer: Renderer2) {}

  toggleSidenav() {
    this.expanded = !this.expanded;
    const sidenav = document.querySelector('mat-sidenav');
    if (sidenav) {
      if (this.expanded) {
        this.renderer.addClass(sidenav, 'expanded');
      } else {
        this.renderer.removeClass(sidenav, 'expanded');
      }
    }
  }
}
