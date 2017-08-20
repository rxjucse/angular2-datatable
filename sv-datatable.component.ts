import { Component, ContentChildren, ContentChild, ViewChild, OnDestroy, EventEmitter, ElementRef, TemplateRef, OnInit, QueryList, Input, Output } from '@angular/core';
import { SvDatatableColumnComponent } from './sv-datatable-column.component';
import { Subscription } from 'rxjs/Subscription';
import * as _ from "lodash";


@Component({
  selector: 'sv-datatable',
  templateUrl: './sv-datatable.component.html',
  styleUrls: ['./sv-datatable.component.scss']
})
export class SvDatatableComponent implements OnInit, OnDestroy {
  @ContentChildren(SvDatatableColumnComponent) cols: QueryList<SvDatatableColumnComponent>;

  @ViewChild('svDataTableHeaderRef') svDataTableHeaderRef: ElementRef;

  @ViewChild('svDataTableBodyRef') svDataTableBodyRef: ElementRef;

  @ContentChild('rowExpansion', { read: TemplateRef }) rowExpansion: TemplateRef<any> = null;


  @Input() dataTableColumnStyle;

  @Input() scrollable: boolean = false;

  @Input() scrollHeight: string = "";

  @Input() selectionEnable: boolean = false;

  @Input() showTableHeader: boolean = true;

  @Input() expanderTemplateStyle: any;

  @Input() styleClass: string;

  @Input() sortOrder: number = 1;

  @Input() infiniteScroller: boolean = false;

  @Input('value')
  public set updateValue(data) {
    this.rootCollection = data;
    if (this.infiniteScroller) {
      if (data) {
        this.value = [];
        let endPoint: number = this.rootCollection.length <= 25 ? this.rootCollection.length : 25;
        let tempCollection: any[] = [];
        for (let i = 0; i < endPoint; i++) {
          tempCollection.push(this.rootCollection[i]);
          this.lastInsertIndex = i;
        }
        this.value = tempCollection;
        this.sum = endPoint;
        this.svDataTableBodyRef.nativeElement.scrollTop=0;
      }
    } else {
      this.value = data;
    }
    
  }

  @Input('sortField')
  set dataSourceUpdate(fieldName) {
    if (fieldName == '') {
      return;
    }
    else {
      if(this.value)
        this.sortDataSource(this.sortOrder === 1 ? true : false, fieldName);
    }
  }

  @Input()
  get selection() {
    return this.selectedRowData;
  }

  set selection(selectedRowData) {
    this.selectedRowData = selectedRowData;
  }

  @Output() selectionChange = new EventEmitter();
  @Output() onRowSelect = new EventEmitter();


  private _rowList: Array<any> = [];

  get rowList(): Array<any> {
    return this._rowList;
  }

  @Input('rowList')
  set rowList(value: Array<any>) {
    this._rowList = value;
  }


  columns: SvDatatableColumnComponent[] = [];

  private value;

  private rootCollection;

  selectedRowData: any = null;

  isAscSortActive: boolean = true;

  sortedColumn: string = '';

  showExpandTemplate: boolean = false;

  expandTemplateObj: any = null;

  columnsSubscription: Subscription;


  constructor() { }

  ngOnInit() { }

  ngAfterContentInit() {
    this.columns = this.cols.toArray();
    this.columnsSubscription = this.cols.changes.subscribe(_ => {
      this.columns = this.cols.toArray();
    });

  }
  ngAfterViewInit() {

  }

  ngAfterViewChecked() {
    if (this.scrollable && this.svDataTableBodyRef && (this.svDataTableBodyRef.nativeElement.offsetHeight < this.svDataTableBodyRef.nativeElement.scrollHeight)) {
      this.svDataTableHeaderRef.nativeElement.style.width = 'calc(100% - 17px)';
    } else {
      this.svDataTableHeaderRef.nativeElement.style.width = '100%';
    }
  }

  tableHeaderClickHandler(event: any, isSortable: boolean, column: string, customSortable: boolean, columnObj: SvDatatableColumnComponent) {
    event.stopPropagation();
    if (isSortable || customSortable) {
      this.isAscSortActive = this.sortedColumn === '' ? true : !this.isAscSortActive;
      this.sortedColumn = column;
      if (customSortable) {
        let order = this.isAscSortActive ? 1 : -1;
        columnObj.sortFunction.emit({ column: column, order: order });
      } else {
        this.sortDataSource(this.isAscSortActive, column);
      }
    }
  }

  tableRowClickHandler(event: any, selectedData: any, expenderCol: boolean) {
    event.stopPropagation();
    if (this.selectionEnable) {
      if (!expenderCol) {
        this.selectedRowData = selectedData;
        this.selectionChange.emit(this.selectedRowData);
        let emitObj = {
          event: event,
          data: selectedData
        };
        this.onRowSelect.emit(emitObj);

      } else {
        // this.expandTemplateObj = selectedData;
      }
    }
  }

  toggleRowHighlight(valueObj: any) {
    return _.isEqual(valueObj, this.selectedRowData);
  }

  expandIconClickHandler(valueObj: any) {
    let match = _.find(this._rowList, valueObj);
    if (match) {
      _.remove(this._rowList, valueObj);
    }
    else {
      this._rowList.push(valueObj);
    }

  }

  showExpandTemplateHandler(valueObj: any) {
    return _.find(this._rowList, valueObj);
  }

  getSortingIcon(field: string) {
    if (this.sortedColumn === '') {
      return { 'fa-sort': true };
    } else {
      if (this.sortedColumn === field) {
        return this.isAscSortActive ? { 'fa-sort-asc': true } : { 'fa-sort-desc': true };
      } else {
        return { 'fa-sort': true };
      }
    }
  }

  private sortDataSource(performAscSort: boolean = true, columnName: string) {
    this.value.sort((a: any, b: any) => {
      let firstItem: string = '';
      let secondItem: string = '';
      firstItem = performAscSort ? a[columnName] : b[columnName];
      secondItem = performAscSort ? b[columnName] : a[columnName];
      if (firstItem < secondItem)
        return -1;
      else if (firstItem > secondItem)
        return 1;
      else
        return 0;
    });
  }

  getCompleteColumnStyle(columnStyle: any) {
    //merge style object from SVDataTableColumnComponent and
    //dataTableColumnStyle from SvDatatableComponent
    if (columnStyle === null) {
      return this.dataTableColumnStyle ? this.dataTableColumnStyle : null;
    } else {
      if (this.dataTableColumnStyle) {
        return _.assign({}, this.dataTableColumnStyle, columnStyle);
      } else {
        return columnStyle;
      }
    }

  }

  
  ngOnDestroy() {
    if (this.columnsSubscription) {
      this.columnsSubscription.unsubscribe();
    }
  }



  throttle = 300;
  scrollDistance = 1;
  sum = 20;
  lastInsertIndex = 0;
  onScrollDown() {
    if (this.infiniteScroller) {

      let endIndex = this.sum + 20;
      if (endIndex <= this.rootCollection.length) {
        this.addToValues(this.sum, endIndex);
        this.sum = endIndex;

      }
      else {
        if (this.lastInsertIndex < this.rootCollection.length) {
          this.addToValues(this.lastInsertIndex + 1, this.rootCollection.length);
          this.sum = this.rootCollection.length;
        }
      }
    }


  }
  addToValues(startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; ++i) {
      this.value.push(this.rootCollection[i]);
      this.lastInsertIndex = i;

    }
  }


}
