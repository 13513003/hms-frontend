import 'rxjs/add/operator/switchMap';
import { Component, Input, OnInit }	from '@angular/core';
import { ActivatedRoute, Params }	from '@angular/router';
import { Location }					from '@angular/common';

import { Transaksi }						from '../transaksi/transaksi';
import { TransaksiService }			from '../transaksi/transaksi.service';
import { Rawatinap }			from './rawatinap';
import { RawatinapService }		from './rawatinap.service';
import { Tempattidur }          from './tempattidur';
import { TempattidurService }		from './tempattidur.service';
import { PemakaianKamar }          from './pemakaian-kamar';
import { PemakaianKamarService }   from './pemakaian-kamar.service';
import { TenagaMedis }		from '../tenaga-medis/tenaga-medis';
import { TenagaMedisService }		from '../tenaga-medis/tenaga-medis.service';


@Component({
 	selector: 'pindahkamar-detail-page',
 	templateUrl: './pindahkamar-detail.component.html',
 	providers: [
         RawatinapService,
         TempattidurService,
		 PemakaianKamarService,
         TransaksiService,
		 TenagaMedisService
    ]
})

export class PindahKamarDetailComponent implements OnInit {
	rawatinap: Rawatinap;
    allTempatTidur: Tempattidur[];
	allTenagaMedis: TenagaMedis[];
    transaksi: Transaksi[];
	noKamar: string;
	selectedTempatTidur: number;
	pemakaianKamar: PemakaianKamar;
	pemakaianKamarModal : PemakaianKamar = null;
	tempatTidurModal : Tempattidur = null;

	constructor(
		private transaksiService: TransaksiService,
		private rawatinapService: RawatinapService,
		private tempattidurService: TempattidurService,
		private pemakaianKamarService: PemakaianKamarService,
		private tenagaMedisService: TenagaMedisService,
		private route: ActivatedRoute,
		private location: Location
	) {}

	ngOnInit(): void {
		this.route.params
			.switchMap((params: Params) => this.pemakaianKamarService.getPemakaianKamar(params['idPemakaian']))
			.subscribe( data =>  this.pemakaianKamar = data);
		
		this.route.params
			.switchMap((params: Params) => this.rawatinapService.getRawatinap(params['noKamar']))
			.subscribe(rawatinap => this.rawatinap = rawatinap);
	
		this.route.params
			.switchMap((params: Params) => this.tempattidurService.getAllTempattidur(params['noKamar']))
			.subscribe(data => this.allTempatTidur = data);
		
		this.tenagaMedisService.getAllTenagaMedis()
			.subscribe(data => this.allTenagaMedis = data);
	}

	getRecentTransaksi(nama_pasien: string) {
		this.transaksiService.getRecentTransaksi(nama_pasien).
			subscribe(data => {
				this.transaksi = data;
			})
	}

	selectTempatTidur(noTempatTidur:number) : void {
		if(noTempatTidur === this.tempattidurService.selectedTempatTidur) {
			this.tempattidurService.selectedTempatTidur = 0;
			this.selectedTempatTidur = 0;
		}
		else {
			this.tempattidurService.selectedTempatTidur = noTempatTidur;
			this.selectedTempatTidur = noTempatTidur;
		}
	}

	isSelected(noTempatTidur:number) {
		return(this.tempattidurService.selectedTempatTidur === noTempatTidur);
	}

	checkStatus(noTempatTidur:number) {
		return (this.allTempatTidur[noTempatTidur-1].status == 1); 
	}

	newPemakaianKamar() {
    	this.pemakaianKamarModal = new PemakaianKamar();
		this.pemakaianKamar.no_kamar = this.rawatinap.no_kamar;
		this.pemakaianKamar.harga = this.rawatinap.harga_per_hari;
		this.pemakaianKamar.no_tempat_tidur = this.tempattidurService.selectedTempatTidur;

		this.tempatTidurModal = new Tempattidur();
		this.tempatTidurModal.no_kamar = this.rawatinap.no_kamar;
		this.tempatTidurModal.no_tempat_tidur = this.tempattidurService.selectedTempatTidur;
		this.tempatTidurModal.status = 0;
 	}

    pindahPemakaianKamar(noKamar: string, noTempatTidur: number) {
    	this.pemakaianKamarService.pindahPemakaianKamar(this.pemakaianKamar.id, this.pemakaianKamar).subscribe(
      		data => { 
				this.tempattidurService.updateTempatTidur(this.tempatTidurModal, noKamar, noTempatTidur).subscribe(
					data => {
 						window.location.reload();
					}
				);
			}
    	);
  	}

	goBack(): void {
		this.location.back();
	}
}