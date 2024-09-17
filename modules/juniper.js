import { Client } from "ssh2";
const conn = new Client();

let getConfig = async () => {
	return new Promise((resolve, reject) => {
		let rtn = '';

		conn.on('ready', async () => {
			conn.shell((err, stream) => {
				if (err) reject(err);

				let buffer = '';
				
				// Regex to match 'more' prompts
				const moreRegex = /---\(more\)---/;
				const morePercentageRegex = /---\(more\s\d+%\)---/;
				const endRegex = /patrickgilsf@HOME-2300>/
				
				//handle closing stream
				stream.on('close', () => {
					console.log('Stream :: close');
					conn.end();
					resolve(rtn);
				})
				
				//send command
				stream.write('show configuration\n');

				//parses data, acts according
				stream.on('data', (data) => {
					buffer += data.toString('utf8');
					
					if (moreRegex.test(buffer) || morePercentageRegex.test(buffer)) {
						rtn += buffer;
						buffer = "";
						stream.write(" ");
					} else if (endRegex.test(buffer)) {
						// console.log(buffer);
						stream.close();
					}
					// // Split buffer into lines
					// let lines = buffer.split('\n');
					
					// lines.forEach((line) => {

					// 	console.log(line);
					// 	// line = line.trim();


					// 	if (moreRegex.test(line) || morePercentageRegex.test(line)) {

					// 		buffer = '';
					// 		stream.write(' '); // Send space to continue output
					// 		return;
							
							
					// 	} else if (endRegex.test(line)) {
					// 		stream.close();
					// 		// console.log(line);
					// 	} else {
					// 		// console.log(line);
					// 		rtn += line;
					// 	}
					// });
				});
		
				// Initial command to start the interaction
				// stream.write('show configuration\n');
			
			});
		}).connect({
			host: '192.168.42.180',
			port: 22,
			username: 'patrickgilsf',
			password: '@V0IP!' // Replace 'password' with the actual password
		});
	});
};

console.log(await getConfig());