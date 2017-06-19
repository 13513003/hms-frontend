import { Component } from '@angular/core';

import { ObatRusak }			from './obat-rusak';
import { ObatRusakService }		from './obat-rusak.service';

@Component({
 	selector: 'daftar-obat-rusak-page',
 	templateUrl: './daftar-obat-rusak.component.html',
 	providers: [ObatRusakService]
})

export class DaftarObatRusakComponent {

	public allObatRusak: ObatRusak[];

	public filterQuery = "";
    public rowsOnPage = 5;
    public sortBy = "waktu_keluar";
    public sortOrder = "asc";

	constructor(
		private ObatRusakService: ObatRusakService
	) {}

	ngOnInit(): void {
		this.ObatRusakService.getAllObatRusak()
			.then(allObatRusak => this.allObatRusak = allObatRusak);
	}

	onClickDatePicker(): void {
		
	}
}