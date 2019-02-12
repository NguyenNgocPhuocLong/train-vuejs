import { Component, ViewChild , OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Contact, Social, Image } from '../../model.component';
import { Validators, FormGroup, FormArray, FormBuilder, AbstractControl } from '@angular/forms';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AdminService } from '../admin.service';
declare var Lobibox: any;
import { Cookie } from 'ng2-cookies';
@Component({
    selector: 'contact-admin',
    templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit {
    public contact: Contact = new Contact();
    public list: Array<Contact> = new Array<Contact>();
    public edit: boolean = false;
    open: boolean = false;
    public social: Social = new Social();
    public BusinessHours: AbstractControl;
    public listCurrent: Array<Contact> = new Array<Contact>();
    public languages: Array<string> = new Array<string>();
    public curLang: string = localStorage.getItem("language");
    public config = {
        uiColor: '#F0F3F4',
        height: '200',
        removeButtons: 'ImageButton,Image'
    };
    public content: any;
    public linkApi: string;
    public form: FormGroup;
    public submitted: boolean = false;
    search:string="";
    constructor(private translate: TranslateService, private fb: FormBuilder, private sanitizer: DomSanitizer, private server: AdminService) {
        Cookie.set(this.server.keyFolder, "Contact");
        this.languages = translate.getLangs();
        this.initForm(this.contact);
    }
    public initForm(item: Contact) {
        this.form = this.fb.group({
            ContactId: item.ContactId,
            Phone: [item.Phone, Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(80)])],
            Address: [item.Address, Validators.compose([Validators.required, Validators.minLength(1)])],
            BusinessHours: item.BusinessHours,
            MapUrl: [item.MapUrl, Validators.compose([Validators.required, Validators.minLength(1)])],
            Language: item.ContactId == 0 ? this.curLang : item.Language,
            IsActive: true,
            ImageId: item.ImageId,
            Image: this.initImage(item.Image),
            Socials: this.fb.array([

            ])
        });
        if (item.Socials.length == 0) {
            this.addSocial(this.social);
        }
        else {
            for (let s of item.Socials) {
                this.addSocial(s);
            }
        }
    }
    public ngOnInit() {
        this.getContact();
    }
    public trustSrcUrl(link: string) {
        this.content = this.sanitizer.bypassSecurityTrustHtml(link);
    }
    public getContact() {
        this.server.show();
        this.server.get('admin/GetContactPage').subscribe((data: any) => {
            this.server.hide();
            this.list = data;
            this.listCurrent = this.list;
        }, err => {
            this.server.hide();
            this.server.removeCookie();
        });
    }
    public initSocial(item: Social) {
        return this.fb.group({
            ContactId: this.contact.ContactId,
            Link: [item.Link, Validators.compose([Validators.required, Validators.minLength(1)])],
            Logo: [item.Logo, Validators.compose([Validators.required, Validators.minLength(1)])],
            SocialId: item.SocialId,
            SocialName: [item.SocialName, Validators.compose([Validators.required, Validators.minLength(1)])],
        });
    }
    public addSocial(newContact: Social) {
        const control = <FormArray>this.form.controls['Socials'];
        control.push(this.initSocial(newContact));
    }
    public removeSocial(i: number) {
        const control = <FormArray>this.form.controls['Socials'];
        control.removeAt(i);
    }
    public initImage(item: Image) {
        return this.fb.group({
            ImageId: item.ImageId,
            ImageName: item.ImageName,
            ImageType: item.ImageType
        });
    }
    public convertLanguage(language: string) {
        this.curLang = language;
        localStorage.setItem("language", this.curLang);
        this.translate.use(this.curLang);
        this.getContact();
    }

    public Save(values: Contact) {
        let checkContact = this.list.find(s => s.Language == this.form.get(['Language']).value && s.IsActive && s.ContactId != values.ContactId);
        if (checkContact != null) {
            this.server.onShowMsg("error", this.translate.instant("question.error"), this.translate.instant('error.contactExists'));
            return false;
        }
        let path = /^[0-9\-\)\(\+\ \,]{8,80}$/;
        let result = path.test(this.form.get(['Phone']).value);
        if (result == false) {
            this.server.onShowMsg("error", this.translate.instant("question.error"), this.translate.instant('error.phone'));
            return false;
        }
        if (this.form.invalid) {
            if (this.form.controls['Phone'].invalid) {
                this.server.onShowMsg("error", this.translate.instant("question.error"), this.translate.instant('error.phone'));
                return false;
            }
            if (this.form.controls['Address'].invalid) {
                this.server.onShowMsg("error", this.translate.instant("question.error"), this.translate.instant('error.address'));
                return false;
            }
            if (this.form.controls['BusinessHours'].invalid) {
                this.server.onShowMsg("error", this.translate.instant("question.error"), this.translate.instant('error.openhour'));
                return false;
            }
            if (this.form.controls['MapUrl'].invalid) {
                this.server.onShowMsg("error", this.translate.instant("question.error"), this.translate.instant('error.mapurl'));
                return false;
            }
            if (this.form.controls['Socials'].invalid) {
                this.server.onShowMsg("error", this.translate.instant("question.error"), this.translate.instant('error.social'));
                return false;
            }
        }

        else {
            if (this.form.valid) {
                if (!this.submitted) {
                    this.submitted = true;
                    this.server.show();
                    this.server.post('admin/UpdateContactPage', values).subscribe((data: any) => {
                        this.Cancel();
                         this.server.onShowMsg("success", this.translate.instant("question.success"), "");
                        this.server.hide();
                        this.submitted = false;
                    }, error => {
                        this.server.hide();
                        this.server.onShowMsg("error", this.translate.instant("question.error"), error);
                        this.submitted = false;
                    });
                }
            }
        }
    }
    public Edit(item: Contact) {
        this.contact = item;
        this.initForm(this.contact);
        this.edit = true;
    }
    public Remove(item: Contact) {
        Lobibox.confirm({
            msg: this.translate.instant('question.remove'),
            callback: ($this, type, ev) => {
                if (type == "yes") {
                    if (item.ContactId > 0) {
                        this.server.show();
                        this.server.remove('admin/DeleteContactPage', item.ContactId).subscribe(
                            (data: any) => {
                                this.server.hide();
                                this.ngOnInit();
                                this.server.onShowMsg("success", this.translate.instant("question.success"), this.translate.instant("question.success"));
                            },
                            error => {
                                this.server.hide();
                                this.server.onShowMsg("error", this.translate.instant("question.error"), error);
                            },
                            () => { });
                    }
                }
            }
        });
    }
    public Search(event: any) {
        if (event != null && event.trim() != '') {
            this.listCurrent = this.list.filter(s => s.Language.toLocaleLowerCase().search(event.toLocaleLowerCase()) != -1 || s.Phone.search(event) != -1 || s.Address.toLocaleLowerCase().search(event.toLocaleLowerCase()) != -1);
        }
        else {
            this.listCurrent = this.list;
        }
    }
    public Cancel() {
        this.edit = false;
        this.contact = new Contact();
        this.initForm(this.contact);
        this.getContact();
    }
   
    public closed(value: any) {
        this.open = false;
    }
    public selectImage(value: Image) {
        this.form.get('ImageId').setValue(value.ImageId);
        const control = this.form.controls['Image'];
        control.setValue(value);
        this.open = false;
    }
}
