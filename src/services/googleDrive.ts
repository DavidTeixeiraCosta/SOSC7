import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

const FOLDER_NAME = 'Chip7_OS_Backups';

/**
 * Searches for or creates a dedicated folder in Google Drive for Chip7 OS files.
 */
export async function getOrCreateChip7Folder(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Drive.');

  // Search if folder exists
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.text();
    throw new Error(`Erro ao buscar pasta no Drive: ${err}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Pasta do Sistema Chip7 - Ordens de Serviço (Backups e Documentos)'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Erro ao criar pasta no Drive: ${err}`);
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Lists files in the Chip7 folder or backup files in Drive.
 */
export async function listDriveBackupFiles(): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Drive.');

  let folderId: string | null = null;
  try {
    folderId = await getOrCreateChip7Folder();
  } catch (e) {
    console.warn('Could not get Chip7 folder, fallback to searching by name', e);
  }

  const query = folderId
    ? encodeURIComponent(`'${folderId}' in parents and trashed = false`)
    : encodeURIComponent(`name contains 'chip7' and trashed = false`);

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,iconLink)`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao listar arquivos do Drive: ${err}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Uploads a file to Google Drive using multipart upload.
 */
export async function uploadFileToDrive(
  fileName: string,
  content: string,
  mimeType: string = 'application/json',
  description?: string
): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Drive.');

  const folderId = await getOrCreateChip7Folder();

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: folderId ? [folderId] : undefined,
    description: description || 'Arquivo salvo pelo Sistema Chip7 Informática'
  };

  const boundary = '-------Chip7DriveBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}; charset=UTF-8\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,createdTime,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao enviar para Google Drive: ${err}`);
  }

  return await res.json();
}

/**
 * Downloads a file from Google Drive as text.
 */
export async function downloadFileContent(fileId: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Drive.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao baixar arquivo do Drive: ${err}`);
  }

  return await res.text();
}

/**
 * Deletes a file from Google Drive.
 * Per guidelines: MUST be confirmed by user in UI before calling.
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Drive.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro ao excluir arquivo no Drive: ${err}`);
  }
}
