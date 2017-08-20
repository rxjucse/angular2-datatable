import { Component, OnInit, Input, ContentChild, TemplateRef, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'sv-datatable-column',
    template: ``
})
export class SvDatatableColumnComponent implements OnInit {
    @ContentChild('headerTemplate', { read: TemplateRef }) headerTemplate: TemplateRef<any> = null;

    @ContentChild('bodyTemplate', { read: TemplateRef }) bodyTemplate: TemplateRef<any> = null;

    @Input() field;

    @Input() header;

    @Input() styleClass: string;

    @Input() sortable: boolean = false;

    @Input() style;

    @Input() expander: boolean = false;

    @Input() customSortable:boolean=false;
    
    @Output() sortFunction = new EventEmitter();


    constructor() {}

    ngOnInit() {
    }

}
