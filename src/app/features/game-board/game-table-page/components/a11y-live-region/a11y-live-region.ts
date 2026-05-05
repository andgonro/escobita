import { Component, Input, Signal, signal } from '@angular/core';

@Component({
  selector: 'app-a11y-live-region',
  imports: [],
  templateUrl: './a11y-live-region.html',
  styleUrl: './a11y-live-region.scss',
})
export class A11yLiveRegion {
  private readonly messageState = signal('');

  protected readonly messageSignal: Signal<string> = this.messageState.asReadonly();

  @Input()
  set message(value: string) {
    this.messageState.set(value ?? '');
  }

  get message(): string {
    return this.messageState();
  }
}
