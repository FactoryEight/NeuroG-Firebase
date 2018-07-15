$(document).ready(function () {
  var timeData = [],
    heartRateData = [],
    gsrData = [],
    poorQualityData = [],
    attentionData = [],
    meditationData = [];
  var data = {
    labels: timeData,
    datasets: [{
        fill: false,
        label: 'Heart Rate',
        yAxisID: 'HeartRate',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: heartRateData
      },
      {
        fill: false,
        label: 'Galvanic Skin Response',
        yAxisID: 'GalvanicSkinResponse',
        borderColor: "rgba(240, 84, 84, 1)",
        pointBoarderColor: "rgba(240, 84, 84, 1)",
        backgroundColor: "rgba(240, 84, 84, 0.4)",
        pointHoverBackgroundColor: "rgba(240, 84, 84, 1)",
        pointHoverBorderColor: "rgba(240, 84, 84, 1)",
        data: gsrData
      },
      {
        fill: false,
        label: 'Poor Quality',
        yAxisID: 'PoorQuality',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: poorQualityData
      },
      {
        fill: false,
        label: 'Attention',
        yAxisID: 'Attention',
        borderColor: "rgba(24, 80, 20, 1)",
        pointBoarderColor: "rgba(24, 80, 20, 1)",
        backgroundColor: "rgba(24, 80, 20, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 80, 20, 1)",
        pointHoverBorderColor: "rgba(24, 80, 20, 1)",
        data: attentionData
      },
      {
        fill: false,
        label: 'Meditation',
        yAxisID: 'Meditation',
        borderColor: "rgba(24, 180, 20, 1)",
        pointBoarderColor: "rgba(24, 180, 20, 1)",
        backgroundColor: "rgba(24, 180, 20, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 180, 20, 1)",
        pointHoverBorderColor: "rgba(24, 180, 20, 1)",
        data: meditationData
      }
    ]
  }

  var basicOption = {
    title: {
      display: true,
      text: 'Heart Rate, Galvanic-Skin Response and Brain Activity Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'HeartRate',
        type: 'linear',
        scaleLabel: {
          labelString: 'BPM',
          display: true
        },
        position: 'left',
      }, {
        id: 'GalvanicSkinResponse',
        type: 'linear',
        scaleLabel: {
          labelString: 'microsiemens',
          display: true
        },
        position: 'right'
      }, {
        id: 'PoorQuality',
        type: 'linear',
        scaleLabel: {
          labelString: 'Quality',
          display: true
        },
        position: 'right'
      }, {
        id: 'Attention',
        type: 'linear',
        scaleLabel: {
          labelString: 'Attention',
          display: true
        },
        position: 'left'
      }, {
        id: 'Meditation',
        type: 'linear',
        scaleLabel: {
          labelString: 'Intensity',
          display: true
        },
        position: 'left'
      }]
    }
  }

  //Get the context of the canvas element we want to select
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = {
    animation: false
  }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });
  const db = firebase.firestore();

  db.collection('health-data').onSnapshot(message => {
    message.docChanges().forEach(function (change) {
      if (change.type === "added") {
        try {
          var obj = change.doc.data();
          if (!obj.timestamp || !obj.heartRate) {
            return;
          }
          timeData.push(obj.timestamp);
          heartRateData.push(obj.heartRate);
          if (obj.heartRate < 90) {
            $('#HeartRateDescription').text("Heart Rate Normal");
            $('#HeartRateDescription').css('color', 'green')
          } else if (obj.heartRate > 90) {
            $('#HeartRateDescription').text("Heart Rate Elevated");
            $('#HeartRateDescription').css('color', 'orange')
          } else if (obj.heartRate > 120) {
            $('#HeartRateDescription').text("Heart Rate Critical");
            $('#HeartRateDescription').css('color', 'red')
          }
          // only keep no more than 50 points in the line chart
          const maxLen = 50;
          var len = timeData.length;
          if (len > maxLen) {
            timeData.shift();
            heartRateData.shift();
          }

          if (obj.GSR) {
            gsrData.push(obj.GSR);
            if (obj.GSR < 100) {
              $('#GSRDescription').text("Normal Skin Conductance");
              $('#GSRDescription').css('color', 'green')
            } else if (obj.GSR < 150) {
              $('#GSRDescription').text("Sweaty Palms");
              $('#GSRDescription').css('color', 'orange')
            } else if (obj.GSR < 250) {
              $('#GSRDescription').text("High Conductance Please investigate");
              $('#GSRDescription').css('color', 'red')
            }
          }
          if (gsrData.length > maxLen) {
            gsrData.shift();
          }

          if (obj.poorQuality) {
            poorQualityData.push(obj.poorQuality);
          }
          if (poorQualityData.length > maxLen) {
            poorQualityData.shift();
          }

          if (obj.attention) {
            attentionData.push(obj.attention);
            if (obj.attention < 20) {
              $('#AttentionDescription').text("Un attentive");
              $('#AttentionDescription').css('color', 'red')
            } else if (obj.attention < 70) {
              $('#AttentionDescription').text("Slightly Attentive");
              $('#AttentionDescription').css('color', 'orange')
            } else if (obj.attention < 100) {
              $('#AttentionDescription').text("Full attention");
              $('#AttentionDescription').css('color', 'green')
            }
          }
          if (attentionData.length > maxLen) {
            attentionData.shift();
          }

          if (obj.meditation) {
            meditationData.push(obj.meditation);
            if (obj.meditation < 20) {
              $('#MeditationDescription').text("Un attentive");
              $('#MeditationDescription').css('color', 'red')
            } else if (obj.meditation < 70) {
              $('#MeditationDescription').text("Slightly Attentive");
              $('#MeditationDescription').css('color', 'orange')
            } else if (obj.meditation < 100) {
              $('#MeditationDescription').text("Full Meditation");
              $('#MeditationDescription').css('color', 'green')
            }
          }
          if (meditationData.length > maxLen) {
            meditationData.shift();
          }

          myLineChart.update();
        } catch (err) {
          console.error(err);
        }
      }
    });
  });
});