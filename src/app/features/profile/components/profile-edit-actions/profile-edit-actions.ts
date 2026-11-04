import { Component, output } from '@angular/core';

@Component({
    selector: 'app-profile-edit-actions',
    template: `
        <div class="flex flex-wrap gap-2 sm:shrink-0">
            <button type="button" (click)="save.emit()"
                class="px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer">
                Salva
            </button>
            <button type="button" (click)="cancel.emit()"
                class="px-2.5 py-1.5 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer">
                Annulla
            </button>
        </div>
    `,
})
export class ProfileEditActions {
    save = output<void>();
    cancel = output<void>();
}
