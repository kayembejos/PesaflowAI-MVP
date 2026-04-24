import { Component, Input, ElementRef, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import * as d3 from 'd3';

export interface ChartDataPoint {
  category: string;
  current: number;
  previous: number;
}

@Component({
  selector: 'app-budget-chart',
  standalone: true,
  template: `<div class="w-full h-full min-h-[300px]"></div>`,
  styles: [`:host { display: block; width: 100%; }`]
})
export class BudgetChartComponent implements OnInit, OnChanges {
  @Input() data: ChartDataPoint[] = [];
  
  private el = inject(ElementRef);
  private svg: any;
  private width = 0;
  private height = 0;
  private margin = { top: 20, right: 30, bottom: 40, left: 40 };

  ngOnInit() {
    this.createChart();
    window.addEventListener('resize', () => this.updateChart());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.updateChart());
  }

  private createChart() {
    const element = this.el.nativeElement.querySelector('div');
    if (!element) return;
    
    // Setup SVG
    this.svg = d3.select(element)
      .append('svg')
      .style('width', '100%')
      .style('height', '100%');
      
    this.updateChart();
  }

  private updateChart() {
    if (!this.svg || !this.data || this.data.length === 0) return;

    const element = this.el.nativeElement.querySelector('div');
    const containerRect = element.getBoundingClientRect();
    
    this.width = containerRect.width - this.margin.left - this.margin.right;
    this.height = containerRect.height - this.margin.top - this.margin.bottom;
    
    if (this.width <= 0 || this.height <= 0) return;

    this.svg.selectAll('*').remove();

    const g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // X Scale
    const x = d3.scalePoint()
      .domain(this.data.map(d => d.category))
      .range([0, this.width])
      .padding(0.5);

    // Y Scale
    const maxVal = d3.max(this.data, d => Math.max(d.current, d.previous)) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([this.height, 0]);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .attr('class', 'text-xs text-slate-500 font-sans');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d: d3.NumberValue) => d.valueOf() >= 1000 ? d3.format('.1k')(d) : d3.format('d')(d)))
      .attr('class', 'text-xs text-slate-500 font-sans');

    // Line generators
    const lineCurrent = d3.line<ChartDataPoint>()
      .x(d => x(d.category) as number)
      .y(d => y(d.current))
      .curve(d3.curveMonotoneX);

    const linePrevious = d3.line<ChartDataPoint>()
      .x(d => x(d.category) as number)
      .y(d => y(d.previous))
      .curve(d3.curveMonotoneX);

    // Draw Previous Line
    g.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1') // slate-300
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .attr('d', linePrevious);

    // Draw Current Line
    g.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#0d9488') // teal-600
      .attr('stroke-width', 3)
      .attr('d', lineCurrent);

    // Current Points
    g.selectAll('.dot-current')
      .data(this.data)
      .enter().append('circle')
      .attr('class', 'dot-current')
      .attr('cx', (d: ChartDataPoint) => x(d.category) as number)
      .attr('cy', (d: ChartDataPoint) => y(d.current))
      .attr('r', 4)
      .attr('fill', '#0d9488');
      
    // Tooltip setup would go here if needed
  }
}
