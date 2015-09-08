var module = angular.module( 'ngMoogle.reports.weightTrendGraphDirective', [
    'ui.router',
    'angular-flot'
]);

module.directive('wtChart', function($log){
    return{
        restrict: 'E',
        link: function(scope, elem, attrs){            
            var chart = null,
            options = {
                series: {
                    shadowSize: 5
                },
                xaxis: {
                    position:"bottom",
                    tickDecimals: 2,
                    color: "black",
                    mode:"time",
                    axisLabel: "date",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 10
                },
                yaxis: {
                    position:"left",
                    color: "black",
                    tickDecimals: 2,
                    axisLabel: "animal weight (kg)",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 5,
                    min:0
                },
                legend: {
                    noColumns: 1,
                    labelFormatter: function(label, series) {
                        return "<font color=\"white\">" + label + "</font>";
                    },
                    backgroundColor: "#000",
                    backgroundOpacity: 0.9,
                    labelBoxBorderColor: "#000000",
                    position: "nw"
                },
                grid: {
                    hoverable: true,
                    borderWidth: 3,
                    mouseActiveRadius: 10,
                    backgroundColor: {
                        colors: ["#ffffff", "#EDF5FF"]
                    },
                    axisMargin: 20
                }
            };

            scope.$watch(attrs.ngModel, function(v){
//                 if(!chart){
                    chart = $.plot(elem, v , options);
//                     elem.show();
//                 }else{
                    chart.setData(v);
                    chart.setupGrid();
                    chart.draw();
//                 }
            });
            
            $("<div id='tooltip'></div>").css({
                position: "absolute",
                display: "none",
                border: "1px solid #fdd",
                padding: "2px",
                "background-color": "#fee",
                opacity: 0.80
            }).appendTo("body");

            $("#placeholder").bind("plothover", function (event, pos, item) {
                if (item) {
                    var d = new Date(parseInt(item.datapoint[0],10));
                    var w = item.datapoint[1].toFixed(2);

                    $("#tooltip").html(w + "kg average weight measured " + d)
                        .css({top: item.pageY+5, left: item.pageX+5})
                        .fadeIn(200);
                } else {
                    $("#tooltip").hide();
                }
            });
        }
    };
});