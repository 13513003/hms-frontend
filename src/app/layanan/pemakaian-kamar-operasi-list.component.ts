import { Component, OnInit }		from '@angular/core';
import { ActivatedRoute, Params }													from '@angular/router';
import { FormGroup, FormArray, FormBuilder, Validators }	from '@angular/forms';
import { Location }																				from '@angular/common';
import { Observable }																			from 'rxjs/Observable';
import { NgbTypeaheadConfig } 														from '@ng-bootstrap/ng-bootstrap';
import * as _ from "lodash";

import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { PemakaianKamarOperasi } 				from './pemakaian-kamar-operasi';
import { PemakaianKamarOperasiService }		    from './pemakaian-kamar-operasi.service';

import { KamarOperasi } 				      from './kamar-operasi';
import { KamarOperasiService }		    from './kamar-operasi.service';
import { Dokter }                     from '../tenaga-medis/dokter';
import { TenagaMedis } 				from '../tenaga-medis/tenaga-medis';
import { TenagaMedisService }		    from '../tenaga-medis/tenaga-medis.service';
import { TindakanReference } 				from './tindakan-reference';
import { Tindakan } 				from './tindakan';
import { TindakanService }		    from './tindakan.service';
import { TindakanOperasi }			from './tindakan-operasi';
import { TindakanOperasiService }			from './tindakan-operasi.service';

import { Transaksi } 				from '../transaksi/transaksi';
import { TransaksiService }		    from '../transaksi/transaksi.service';
import { Pasien } from '../pasien/pasien';
import { PasienService } from '../pasien/pasien.service';
import { Poliklinik }						from './poliklinik';
import { PoliklinikService }		from './poliklinik.service';


@Component({
 	selector: 'pemakaian-kamar-operasi-list-page',
 	templateUrl: './pemakaian-kamar-operasi-list.component.html',
 	providers: [PemakaianKamarOperasiService,
	 			TenagaMedisService,
				TindakanService,
				TindakanOperasiService,
				TransaksiService,
				PasienService,
				KamarOperasiService,
				ToastyService]
})

export class PemakaianKamarOperasiListComponent implements OnInit {
	allPemakaianKamarOperasi: PemakaianKamarOperasi[];
	allKamarOperasi: KamarOperasi[];
	allDokter: Dokter[];
	allTindakanReference: TindakanReference[];

	tanggalOperasi: Date;
	waktuMasuk: string;
	waktuKeluar: string;

    public allPasien: Pasien[];
    public pasien: Pasien;

	no_pegawai: string;
	noTenagaMedis: string[];

    public transaksi: any;

	pemakaianKamarOperasiModal: PemakaianKamarOperasi = null;
    pemakaianKamarOperasiModalNama: string = null;

	selectedTindakan: Tindakan[] = [];
	savedTindakan: Tindakan[] = [];
	savedTindakanOperasi: TindakanOperasi[] = [];
 	selectedTindakanReference: TindakanReference[] = [];

	transaksi2 : any = null;
	poliklinik: Poliklinik;
	addForm: FormGroup;
	user : any;

	tindakanOperasi : TindakanOperasi[];
	nomorPegawaiDokterPJ: any;

	public selectedDate;
	public param;
	public config;

    inputPasienFormatter = (value : Pasien) => value.nama_pasien;
    resultPasienFormatter = (value: Pasien)	=> value.nama_pasien + ' - ' + value.kode_pasien;

    searchNamaPasien = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => term.length < 2 ? []
				: this.allPasien.filter(pasien => pasien.nama_pasien.toLowerCase().indexOf(term.toLowerCase()) > -1));

	inputFormatter = (value : any) => value.nama;
	resultFormatter = (value : any) => value.kode + ' - ' + value.nama;

	searchTindakan = (text$: Observable<string>) =>
		text$
			.debounceTime(200)
			.distinctUntilChanged()
			.map(term => term.length < 2 ? []
				: this.allTindakanReference.filter(tindakanReference => tindakanReference.nama.toLowerCase().indexOf(term.toLowerCase()) > -1));



	constructor(
		private pemakaianKamarOperasiService: PemakaianKamarOperasiService,
		private tenagaMedisService: TenagaMedisService,
        private formBuilder: FormBuilder,
        private pasienService: PasienService,
		private tindakanService: TindakanService,
		private transaksiService: TransaksiService,
		private kamarOperasiService: KamarOperasiService,
		private tindakanOperasiService : TindakanOperasiService,
		private toastyService: ToastyService
	) {}

	ngOnInit() {
		this.user = JSON.parse(localStorage.getItem('currentUser'));

		this.pemakaianKamarOperasiService.getAllPemakaianKamarOperasiNow().subscribe(
     		data => { this.allPemakaianKamarOperasi = data }
    	);

		this.kamarOperasiService.getAllKamarOperasi().subscribe(
			data =>  { this.allKamarOperasi = data }
		);

		this.tindakanService.getAllTindakanReference().subscribe(
			data => {  this.allTindakanReference = data }
		);

		this.tenagaMedisService.getAllDokter().subscribe(
      		data => this.allDokter = data
   		 );

        this.pasienService.getAllPasien().subscribe(
			data => { this.allPasien = data }
		);
	}

    private addPasien(pasien: Pasien) {
		this.pasien = pasien;

		this.transaksiService.getLatestOpenTransaksi(this.pasien.id).subscribe(
			data => {
				this.transaksi = data;
				this.pemakaianKamarOperasiModal.id_transaksi = this.transaksi.id;
			},
			error => {
				let toastOptions: ToastOptions = {
					title: "Error",
					msg: "Pasien tidak mempunyai transaksi yang open, masukkan pasien lain",
					showClose: true,
					timeout: 5000,
					theme: 'material'
				};
				this.toastyService.error(toastOptions);
			}
		);
    }

	newPemakaianKamarOperasi() {
		this.pemakaianKamarOperasiModal = new PemakaianKamarOperasi();
		this.pemakaianKamarOperasiModal.waktu_masuk_real = new Date().toISOString().slice(0, 10);
 	}

	showDetailPemakaianKamarOperasi(pemakaianKamarOperasiId: number, pemakaianKamarOperasi: PemakaianKamarOperasi) {
		this.pemakaianKamarOperasiModal = Object.assign({}, pemakaianKamarOperasi);
		this.tindakanOperasiService.getTenagaMedisByTindakanOperasi(pemakaianKamarOperasiId).subscribe(
			data => {	this.tindakanOperasi = data   }
		);
	}

	updatePemakaianKamarOperasi() {
		this.pemakaianKamarOperasiService.updatePemakaianKamarOperasi(this.pemakaianKamarOperasiModalNama, this.pemakaianKamarOperasiModal).subscribe(
			data => { this.ngOnInit() }
		);
	}

	destroyPemakaianKamarOperasi(id: number) {
		this.pemakaianKamarOperasiService.destroyPemakaianKamarOperasi(id).subscribe(
			data => { this.ngOnInit() }
		);
	}

	selesaiOperasi(id:number, pemakaianKamarOperasi: PemakaianKamarOperasi) {
		this.pemakaianKamarOperasiService.keluar(id,pemakaianKamarOperasi).subscribe(
			data => { 
				this.ngOnInit();
				let toastOptions:ToastOptions = {
					title: "Success",
					msg: "Checkout berhasil",
					showClose: true,
					timeout: 5000,
					theme: 'material'
				};

				this.toastyService.success(toastOptions);
			}
		)
	}

	getTenagaMedis() {
		this.noTenagaMedis = this.no_pegawai.toString().split(",");
	}

	addSelectedTindakan(tindakanReference: TindakanReference) {
		this.selectedTindakanReference.push(tindakanReference);
		let temp = new Tindakan();
		temp.id_transaksi = this.transaksi.id;
		temp.harga = tindakanReference.harga;
		temp.keterangan = '';
		temp.id_pembayaran = null;
		temp.kode_tindakan = tindakanReference.kode;
		temp.id_pasien = this.transaksi.id_pasien;
		temp.tanggal_waktu = this.transaksi.waktu_masuk_pasien;
		temp.np_tenaga_medis = this.nomorPegawaiDokterPJ;;
		temp.nama_poli = null;
		temp.nama_lab = null;
		temp.nama_ambulans = null;
		this.selectedTindakan.push(temp);

		this.noTenagaMedis.forEach(element => {
			let temp2 = new TindakanOperasi();
			temp2.id_tindakan = null;
			temp2.id_transaksi = this.transaksi.id;
			temp2.np_tenaga_medis = element;
			this.savedTindakanOperasi.push(temp2);
		});
	}

	isTindakanAlreadySelected() {
		return this.selectedTindakan.length == 1;
	}

	removeSelectedTindakan(i: number) {
		this.selectedTindakan.splice(i, 1);
    	this.selectedTindakanReference.splice(i, 1);
	}

	initResepEntry() {
		return this.formBuilder.group({
			obatResep: ['', Validators.required]
		});
	}

	addResepEntry() {
		const control = < FormArray > this.addForm.controls['resepEntry'];
		control.push(this.initResepEntry());
	}

	removeResepEntry(i: number) {
		const control = < FormArray > this.addForm.controls['resepEntry'];
		control.removeAt(i);
	}

	private validateInput(): boolean {
		if	(this.pemakaianKamarOperasiModal.id_transaksi == null) {
			this.handleError("Nama pasien wajib diisi");
			return false;
		} else if (this.pemakaianKamarOperasiModal.no_kamar == null) {
			this.handleError("Nama kamar wajib diisi");
			return false;
		} else if (this.nomorPegawaiDokterPJ == null) {
			this.handleError("Nama dokter PJ wajib diisi");
			return false;
		} else if (this.no_pegawai == null) {
			this.handleError("Nama dokter operasi wajib diisi");
			return false;
		} else if (this.selectedTindakanReference == null) {
			this.handleError("Nama tindakan wajib diisi");
			return false;
		}
		else {
			return true;
		}
	}

	private handleError(error: any) {
		let toastOptions: ToastOptions = {
	        title: "Error",
	        msg: error,
	        showClose: true,
	        timeout: 5000,
	        theme: 'material'
	    };
    	this.toastyService.error(toastOptions);
	}

	createPemakaianKamarOperasi() {
		if(this.validateInput()) {
			this.tindakanService.saveTindakan(this.selectedTindakan).subscribe(
				data => {
					console.log(data);
					this.tindakanOperasiService.createTindakanOperasi(this.savedTindakanOperasi).subscribe(
						data => {
							console.log(data);
							this.pemakaianKamarOperasiService.createPemakaianKamarOperasi(this.pemakaianKamarOperasiModal).subscribe(
								data => {
									this.ngOnInit();
									let toastOptions:ToastOptions = {
										title: "Success",
										msg: "Pasien sudah terdaftar di kamar " + this.pemakaianKamarOperasiModal.no_kamar,
										showClose: true,
										timeout: 5000,
										theme: 'material'
									};

									this.toastyService.success(toastOptions);
								}
							);
						}
					);
				}
			);
		}
	}
}
