const XLSX = require('xlsx');
const fs = require('fs');
const moment = require('moment');

function make_book(data) {
	var ws = XLSX.utils.aoa_to_sheet(data);
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
	return wb;
}

module.exports = (data, req) => {

	const { filename } = req.params;

  let downloadPath = path.resolve(__dirname, '..', 'downloads');

	if(!fs.existsSync(downloadPath)) {

		fs.mkdirSync(downloadPath);

	}

	downloadPath = path.resolve(downloadPath, `${filename}-${moment().format('YYYY-MM-DD-hh-mm')}.xls`);
	
  var wb = make_book(data);

  XLSX.writeFile(wb, downloadPath);

  return downloadPath;
}
