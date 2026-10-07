import { Component, input } from '@angular/core';
import { PasswordRequirements } from '../../validators/password.validator';

@Component({
  selector: 'app-password-requirements-component',
  imports: [],
  templateUrl: './password-requirements-component.html',
  styleUrl: './password-requirements-component.css',
})
export class PasswordRequirementsComponent {
  reqs = input.required<PasswordRequirements>();
}
