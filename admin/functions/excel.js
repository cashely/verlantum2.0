const XLSX = require('xlsx');
const fs = require('fs');

function make_book(data) {
	var ws = XLSX.utils.aoa_to_sheet(data);
	var wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
	return wb;
}

module.exports = (data, file) => {
  var wb = make_book(data);
  XLSX.writeFile(wb, file)
  return file;
}
