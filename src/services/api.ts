const API_URL = 'http://localhost:3000' // Tu gateway

export async function uploadImage(file: File, userId: string) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/descripciones-imagenes/uploadImage/${userId}`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) throw new Error('Error al subir imagen')
  return response.json()
}

export async function crearGroundTruth(data: {
  texto: string
  idImagen: number
  palabrasClave: string[]
  preguntasGuiaPaciente: string[]
}) {
  const response = await fetch(`${API_URL}/descripciones-imagenes/crearGroundTruth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) throw new Error('Error al crear ground truth')
  return response.json()
}

export async function crearSesion(idPaciente: string) {
  const response = await fetch(`${API_URL}/descripciones-imagenes/crearSesion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idPaciente })
  })

  if (!response.ok) throw new Error('Error al crear sesión')
  return response.json()
}

export async function crearDescripcion(data: {
  texto: string
  idImagen: number
  idSesion: number
  idPaciente: string
}) {
  const response = await fetch(`${API_URL}/descripciones-imagenes/crearDescripcion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) throw new Error('Error al crear descripción')
  return response.json()
}

export async function listarImagenes(cuidadorId: string, page = 1, limit = 10) {
  const response = await fetch(
    `${API_URL}/descripciones-imagenes/listarImagenes/${cuidadorId}?page=${page}&limit=${limit}`
  )

  if (!response.ok) throw new Error('Error al listar imágenes')
  return response.json()
}

export async function getBaseline(idPaciente: string) {
  const response = await fetch(`${API_URL}/descripciones-imagenes/baseline/${idPaciente}`)

  if (!response.ok) throw new Error('Error al obtener baseline')
  return response.json()
}

export async function listarSesiones(idPaciente: string, page = 1, limit = 10) {
  const response = await fetch(
    `${API_URL}/descripciones-imagenes/listarSesiones?idPaciente=${idPaciente}&page=${page}&limit=${limit}`
  )

  if (!response.ok) throw new Error('Error al listar sesiones')
  return response.json()
}