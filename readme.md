A reusable linechart in D3.js closely following the proposal set out by Mike Bostock ["Towards Reusable Charts."](http://bost.ocks.org/mike/chart/).

The charts are responsive and include optional hover tooltips. They can be used to create small(ish) multiples. They're designed to work with CSVs, though can probably take local data, too. 

Right now they're intended to show a single column of data, but a sub-module `d3.custom.addLine()` will let you add as many new paths to a chart as you like, although the hover effect will only work on one.

[Demo right here](http://scottpham.github.io/reusable-charts/) using data compiled from the FAA and stockmarket data via Bostock.

![Demo](preview.png)