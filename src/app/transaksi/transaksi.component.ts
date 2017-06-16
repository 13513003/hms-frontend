import { Component }				from '@angular/core';

import { TransaksiService }		from './transaksi.service';
import { Transaksi }			from './transaksi';

@Component({
 	selector: 'transaksi-page',
 	templateUrl: './transaksi.component.html',
 	providers: [TransaksiService]
})

export class TransaksiComponent {
	allTransaksi: Transaksi[];

	constructor(
		private transaksiService: TransaksiService
	) {}

	ngOnInit(): void {
		this.transaksiService.getAllTransaksi()
			.then(allTransaksi => this.allTransaksi = allTransaksi);
	}

	onClickDatePicker(): void {
		
	}
}