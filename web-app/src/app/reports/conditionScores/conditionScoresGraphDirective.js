var module = angular.module( 'ngMoogle.reports.conditionScoreGraphDirective', [
    'ui.router',
    'angular-flot'
]);

module.directive('csChart', function(){
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
                    axisLabel: "condition score",                    
                    tickSize: 0.5,
                    tickDecimals: 1,
                    min:0,
                    max:6.5,
                    tickLength: 0
                },
                yaxis: {
                    position:"left",
                    color: "black",
                    axisLabel: "number of animals",    
                    min:0,
                    tickSize: 5,
                    tickDecimals: 0,
                    tickColor: "#D4D7FE"
                },                
                legend: {
                    noColumns: 1,
                    labelFormatter: function(label, series) {
                        return "<font color='white'>" + label + "</font>";
                    },
                    backgroundColor: "#000",
                    backgroundOpacity: 0.9,
                    labelBoxBorderColor: "#000000",
                    position: "nw"
                },
                grid: {
                    hoverable: true,
                    borderWidth: 2,
                    mouseActiveRadius: 10,
                    backgroundColor: {
                        colors: ["#ffffff", "#EDF5FF"]
                    },
                    axisMargin: 20,
                    verticalLines: false
                },
                axisLabels: {
                    show: true
                }
            };
            
            scope.$watch(attrs.ngModel, function(v){

                // calculate y axis tick size
                var nMax = 0;
                
                v.forEach(function(value) {
                    value.data.forEach(function(dataPoint) {
                        if(dataPoint[1] > nMax) {
                            nMax = dataPoint[1];
                        }
                    });
                });                
                options.yaxis.tickSize = Math.floor(nMax / 3);
                
                // generate graph
                options.color = "#000";
                chart = $.plot(elem, v, options);
                chart.setupGrid();
                chart.draw();
            }, true);
                        
            $("<div id='tooltip'></div>").css({
                position: "absolute",
                display: "none",
                border: "1px solid #fdd",
                padding: "2px",
                "background-color": "#fee",
                opacity: 0.80
            }).appendTo("body");

            $("#placeholdercs").bind("plothover", function (event, pos, item) {
                if (item) {
                    var cs = item.datapoint[0];
                    var n = item.datapoint[1];
                    
                    $("#tooltip").html(n + " animals have a condition score of " + cs)
                        .css({top: item.pageY+5, left: item.pageX+5})
                        .fadeIn(200);
                } else {
                    $("#tooltip").hide();
                }
            });
        }
    };  
});