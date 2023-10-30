import CheckIcon from '@mui/icons-material/Check';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PoolIcon from '@mui/icons-material/Pool';
import { IconButton, Paper, Stack } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';
import RnaDetails from './RnaDetails';
import styles from './styles';

const RnaCard = ({ rna, downloadHandler }) => {
	const [isLoading, setIsLoading] = useState(false);

	const onDownloadClick = async () => {
		setIsLoading(true);
		await downloadHandler();
		setIsLoading(false);

		const downloadedMessage = 'This RNA will now update on Synchronization';

		toast.info(downloadedMessage, {
			toastId: downloadedMessage,
			autoClose: 4000,
		});
	};

	return (
		<Paper elevation={2} sx={styles.rnaCard(rna.isDownloaded)}>
			<Stack direction='row'>
				<IconButton disabled sx={styles.cardButtons}>
					<PoolIcon />
				</IconButton>
				<RnaDetails rna={rna} />
				<IconButton
					disabled={isLoading || rna.isDownloaded}
					onClick={onDownloadClick}
					sx={styles.cardButtons}
				>
					{rna.isDownloaded ? (
						<CheckIcon />
					) : (
						<FileDownloadOutlinedIcon />
					)}
				</IconButton>
			</Stack>
		</Paper>
	);
};

export default RnaCard;
