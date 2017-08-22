import { Component, OnInit }		  from '@angular/core';
import { Router }                 from '@angular/router';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { Observable }             from 'rxjs/Observable';

import { Ambulans }               from '../layanan/ambulans';
import { AmbulansService }        from '../layanan/ambulans.service';
import { Antrian }                from '../antrian/antrian';
import { AntrianService }         from '../antrian/antrian.service';
import { Dokter }                 from './dokter';
import { Poliklinik }             from '../layanan/poliklinik';
import { PoliklinikService }      from '../layanan/poliklinik.service';
import { Transaksi }              from '../transaksi/transaksi';
import { TransaksiService }       from '../transaksi/transaksi.service';
import { TenagaMedisService }     from './tenaga-medis.service';
import { Tindakan }               from '../layanan/tindakan';
import { TindakanService }        from '../layanan/tindakan.service';
import { TindakanOperasi }               from '../layanan/tindakan-operasi';
import { TindakanOperasiService }        from '../layanan/tindakan-operasi.service';
import { PemakaianKamar }  from '../layanan/pemakaian-kamar';
import { PemakaianKamarService }  from '../layanan/pemakaian-kamar.service';
import { PemakaianKamarOperasi }  from '../layanan/pemakaian-kamar-operasi';
import { PemakaianKamarOperasiService }  from '../layanan/pemakaian-kamar-operasi.service';

import * as io from "socket.io-client";

@Component({
  selector: 'dokter-dashboard-page',
  templateUrl: './dokter-dashboard.component.html',
  providers: [
    AntrianService,
    AmbulansService,
    PoliklinikService,
    TenagaMedisService,
    TransaksiService,
    TindakanService,
    TindakanOperasiService,
    PemakaianKamarService,
    PemakaianKamarOperasiService
  ]
})

export class DokterDashboardComponent implements OnInit {
  dokter: Dokter = null;
  socket: any = null;

  allAmbulans: Ambulans[] = [];
  allAntrian: Antrian[] = [];
  allOnProcessAntrian: Antrian[] = [];
  allProcessedAntrian: Antrian[] = [];
  allPoliklinik: Poliklinik[] = [];

  allPemakaianRawat: any[] = [];
  allPemakaianICU: any[] = [];
  allPemakaianOperasi: any[] = [];
  allPemakaianOperasiTemp:any[] = [];

  allDaftarPemakaianRawatinap: any[] = [];
  allDaftarPemakaianICU: any[] = [];
  allDaftarPemakaianOperasi: any[] = [];

  allJasaDokterRawatinap: any[] = [];
  allJasaDokterOperasi: any[] = [];

  showPoliButton: boolean = true;
  poliklinikSelected: boolean = false;
  rawatinapSelected: boolean = false;
  icuSelected: boolean = false;
  operasiSeleted: boolean = false;
  selectedPoliklinik: Poliklinik = new Poliklinik();
  selectedAmbulans: Ambulans = null;
  selectedPemakaianRawatinap: any;
  selectedPemakaianICU: any;
  selectedPemakaianOperasi: any;

  tindakanOperasi: any[];

  transaksiRujukan: Transaksi = null;
  transaksiAmbulans: any = null;
  nama_poli: string = null;
  searchKodePasien: string = '';
  noPegawai: string

  public filterQuery = "";
  public rowsOnPage = 5;
  public sortBy = "no_antrian";
  public sortOrder = "asc";

  constructor(
    private router: Router,
    private ambulansService: AmbulansService,
    private antrianService: AntrianService,
		private poliklinikService: PoliklinikService,
    private tenagaMedisService: TenagaMedisService,
    private transaksiService: TransaksiService,
    private tindakanService: TindakanService,
    private tindakanOperasiService: TindakanOperasiService,
    private pemakaianKamarService: PemakaianKamarService,
    private pemakaianKamarOperasiService: PemakaianKamarOperasiService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig
	) {
    this.socket = io('http://localhost')
  }

  ngOnInit() {
    this.noPegawai = JSON.parse(localStorage.getItem('currentUser')).no_pegawai;

    let observables = [];

    observables.push(this.tenagaMedisService.getDokter(this.noPegawai));
    observables.push(this.poliklinikService.getAllPoliklinik());

    Observable.forkJoin(observables).subscribe(
      data => {
        this.dokter = data[0] as Dokter;
        this.allPoliklinik = data[1] as Poliklinik[];
        this.allPoliklinik = this.allPoliklinik.filter((poliklinik) => poliklinik.nama.indexOf(this.dokter.spesialis) > -1);

        if (this.allPoliklinik.length > 0) {
          this.selectedPoliklinik = this.allPoliklinik[0];
          this.showDaftarPasien();
        }
      }
    );

    this.ambulansService.getAllAvailableAmbulans().subscribe(
      data => { this.allAmbulans = data }
    );

    this.pemakaianKamarService.getAllPemakaianKamarDokterDashboard().subscribe(
      data => { this.allPemakaianRawat = data }
    );

    // this.pemakaianKamarService.getJasaDokterRawatinap(this.noPegawai).subscribe(
    //   data => {
    //     this.allJasaDokterRawatinap = data;
    //     this.pemakaianKamarService.getAllPemakaianKamarICUByNoPegawai(this.noPegawai).subscribe(
    //       data => {
    //         this.allPemakaianICU = data;
    //         this.pemakaianKamarService.getAllPemakaianKamarRawatinapByNoPegawai(this.noPegawai).subscribe(
    //           data => {
    //             this.allPemakaianRawat = data;
    //             if(this.allJasaDokterRawatinap.length > 0) {
    //               this.allJasaDokterRawatinap.forEach(element => {
    //                 this.pemakaianKamarService.getPemakaianKamar(element.id_pemakaian_kamar_rawatinap).subscribe(
    //                   data=> {
    //                     if(data.jenis_kamar == "Rawat Inap")
    //                       this.allPemakaianRawat.push(data);
    //                     else if(data.jenis_kamar == "ICU")
    //                       this.allPemakaianICU.push(data);
    //                   }
    //                 )
    //               });
    //             }
    //           }
    //         )
    //       }
    //     )
    //   }
    // )

    this.pemakaianKamarOperasiService.getAllPemakaianKamarOperasiNow().subscribe(
     		data => {
           this.allPemakaianOperasiTemp = data;
           this.allPemakaianOperasiTemp.forEach(element => {
              this.tindakanOperasiService.getTenagaMedisByTindakanOperasi(element.id).subscribe(
                data => {
                  this.tindakanOperasi = data;
                  this.tindakanOperasi.forEach(tindakanoperasi => {
                    if(tindakanoperasi.no_pegawai == this.noPegawai)
                      this.allPemakaianOperasi.push(element);
                  });
                }
              );
           });
          }
      );



    this.socket.on(this.noPegawai, (message) => this.updatePasienRujukan(message));
  }

  onEnter(event) {
    if (event.keyCode == 13)
      this.searchTransaksi();
  }

  searchTransaksi() {
    if (this.searchKodePasien != '') {
      this.transaksiService.getAllTransaksi(this.searchKodePasien, null, 'open').subscribe(
        data => {
          this.transaksiAmbulans = data
          if (this.transaksiAmbulans.allTransaksi[0] == null) {
            let toastOptions:ToastOptions = {
                title: 'Error',
                msg: 'Kode pasien tidak ditemukan',
                showClose: true,
                timeout: 5000,
                theme: 'material'
            };

            this.toastyService.error(toastOptions);
          }
        }
      )
    }
  }

  pemakaianAmbulans() {
    let tindakan: Tindakan[] = [];
    let temp: Tindakan = new Tindakan();

    temp.id_transaksi = this.transaksiAmbulans.allTransaksi[0].id;
    temp.harga = 50000;
    temp.keterangan = '';
    temp.kode_tindakan = '00.00';
    temp.id_pasien = this.transaksiAmbulans.allTransaksi[0].id_pasien;
    temp.tanggal_waktu = this.transaksiAmbulans.allTransaksi[0].waktu_masuk_pasien;
    temp.np_tenaga_medis = JSON.parse(localStorage.getItem('currentUser')).no_pegawai;
    temp.nama_ambulans = this.selectedAmbulans.nama;
    tindakan.push(temp);

    this.tindakanService.saveTindakan(tindakan).subscribe(
      data => {
        this.selectedAmbulans.status = "In Use";
        this.ambulansService.updateAmbulans(this.selectedAmbulans.nama, this.selectedAmbulans).subscribe(
          data => {
            let toastOptions:ToastOptions = {
                title: 'Success',
                msg: 'Pemakaian ambulans berhasil',
                showClose: true,
                timeout: 5000,
                theme: 'material'
            };

            this.toastyService.success(toastOptions);
          }
        )
      }
    )
  }

  setShowPoliButton(val: boolean) {
    this.showPoliButton = val;
  }

  showDaftarPasien() {
    this.showPoliButton = false;
    this.antrianService.getAllAntrian(this.selectedPoliklinik.nama).subscribe(
      data => {
        this.allAntrian = data;
        this.poliklinikSelected = true;
        this.antrianService.getAntrianWithStatus(this.selectedPoliklinik.nama, 1).subscribe(
          data => {
            this.allOnProcessAntrian = data;
          }
        )
        this.antrianService.getAntrianWithStatus(this.selectedPoliklinik.nama, 2).subscribe(
          data => {
            this.allProcessedAntrian = data;
          }
        )
      }
    )
  }

  showDaftarPasienRawatinap() {
    this.pemakaianKamarService.getAllPemakaianKamarRawatinapByNoKamarAndNoPegawai(this.selectedPemakaianRawatinap.no_kamar, this.noPegawai).subscribe(
      data => {
        this.allDaftarPemakaianRawatinap = data;
        this.rawatinapSelected = true;
        if(this.allJasaDokterRawatinap.length > 0) {
          this.allJasaDokterRawatinap.forEach(element => {
            this.pemakaianKamarService.getPemakaianKamar(element.id_pemakaian_kamar_rawatinap).subscribe(
              data=> {
                if(data.jenis_kamar == "Rawat Inap")
                  this.allDaftarPemakaianRawatinap.push(data);
              }
            )
          });
        }
      }
    )
  }

  showDaftarPasienICU() {
    this.pemakaianKamarService.getAllPemakaianKamarICUByNoKamarAndNoPegawai(this.selectedPemakaianICU.no_kamar, this.noPegawai).subscribe(
      data => {
        this.allDaftarPemakaianICU = data;
        this.icuSelected = true;
        if(this.allJasaDokterRawatinap.length > 0) {
          this.allJasaDokterRawatinap.forEach(element => {
            this.pemakaianKamarService.getPemakaianKamar(element.id_pemakaian_kamar_rawatinap).subscribe(
              data=> {
                if(data.jenis_kamar == "ICU")
                  this.allDaftarPemakaianICU.push(data);
              }
            )
          });
        }
      }
    )
  }

  operasi(no_kamar:string, id:number, id_transaksi:number) {
    this.router.navigate(['/pemakaiankamaroperasi', no_kamar, id, id_transaksi ])
  }

  periksaRawatinap(id_transaksi:number, id_pemakaian: number) {
    this.router.navigate(['/pemeriksaan/rawatinap', this.selectedPemakaianRawatinap.no_kamar, id_pemakaian, id_transaksi])
  }

  periksaICU(id_transaksi:number, id_pemakaian: number) {
    this.router.navigate(['/pemeriksaan/icu', this.selectedPemakaianICU.no_kamar, id_pemakaian, id_transaksi])
  }

  prosesAntrian(id_transaksi: number, no_antrian: number) {
    this.antrianService.processAntrian(id_transaksi, no_antrian).subscribe(
      data => {
        this.router.navigate(['/poliklinik', this.selectedPoliklinik.nama, id_transaksi])
      }
    )
  }

  updatePasienRujukan(message: any) {
    if (this.allAntrian.find(antrian => antrian.id_transaksi == message.id_transaksi)) {
      this.showDaftarPasien();
    }
    else {
      this.nama_poli = message.nama_poli;
      this.transaksiService.getTransaksi(message.id_transaksi).subscribe(
        data => this.transaksiRujukan = data
      )
    }
  }
}
