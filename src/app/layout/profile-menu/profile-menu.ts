import { CommonModule } from '@angular/common';
import { Component, inject, output, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Vehicle } from '../../services/vehicle';
import { VehicleRequest, VehicleResponse } from '../../models/vehicle.model';
import { UserInfoTab } from './tabs/user-info-tab/user-info-tab';
import { UserCredentialTab } from './tabs/user-credential-tab/user-credential-tab';
import { UserVehicleTab } from './tabs/user-vehicle-tab/user-vehicle-tab';

export type ProfileTab = 'Anagrafica' | 'Credenziali' | 'Le tue auto';

@Component({
    selector: 'app-profile-menu',
    imports: [CommonModule, UserInfoTab, UserCredentialTab, UserVehicleTab],
    templateUrl: './profile-menu.html',
    styleUrl: './profile-menu.css',
})
export class ProfileMenu {
    activeTab = signal<ProfileTab>('Anagrafica');
    close = output<void>();

    setTab(tab: ProfileTab): void {
        this.activeTab.set(tab);
    }

    onClose(): void {
        this.close.emit();
    }
}
