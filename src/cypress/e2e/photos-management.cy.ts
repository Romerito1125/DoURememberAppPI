describe('Gestión de Fotos - E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.visit('/')
  })

  describe('Flujo completo: Cargar, Listar, Editar y Eliminar', () => {
    it('debe permitir cargar una nueva foto exitosamente', () => {
      // Navegar a la página de fotos
      cy.visit('/photos')

      // Verificar estado vacío
      cy.contains(/no hay imágenes cargadas/i).should('be.visible')

      // Click en "Cargar Primera Imagen"
      cy.contains('button', /cargar primera imagen/i).click()

      // Verificar que estamos en la página de carga
      cy.url().should('include', '/photos/upload')
      cy.contains('h1', /cargar nueva imagen/i).should('be.visible')

      // Subir archivo
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('fake-image-content'),
          fileName: 'familia-verano.jpg',
          mimeType: 'image/jpeg',
        },
        { force: true }
      )

      // Verificar que se muestra el preview
      cy.contains(/familia-verano.jpg/i).should('be.visible')

      // Llenar el formulario
      cy.get('input').eq(0).type('María López, Juan Pérez, Ana García')
      cy.get('input').eq(1).type('Parque Central de Cali')
      cy.get('textarea').type(
        'Reunión familiar en el parque durante el verano de 2024. Celebramos el cumpleaños de la abuela.'
      )

      // Enviar formulario
      cy.contains('button', /guardar/i).click()

      // Verificar mensaje de éxito
      cy.contains(/imagen guardada exitosamente/i, { timeout: 3000 }).should(
        'be.visible'
      )

      // Verificar redirección a la lista
      cy.url().should('include', '/photos')
      cy.url().should('not.include', '/upload')

      // Verificar que la foto aparece en la lista
      cy.contains('familia-verano.jpg').should('be.visible')
      cy.contains(/maría lópez/i).should('be.visible')
      cy.contains(/parque central/i).should('be.visible')
    })

    it('debe validar campos obligatorios al subir foto', () => {
      cy.visit('/photos/upload')

      // Intentar enviar sin llenar campos
      cy.contains('button', /guardar/i).click()

      // Debe mostrar error de imagen
      cy.contains(/debes seleccionar una imagen/i).should('be.visible')

      // Subir imagen
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('fake'),
          fileName: 'test.jpg',
          mimeType: 'image/jpeg',
        },
        { force: true }
      )

      // Intentar enviar sin personas
      cy.contains('button', /guardar/i).click()
      cy.contains(/personas.*es obligatorio/i).should('be.visible')

      // Llenar personas
      cy.get('input').eq(0).type('Test User')
      cy.contains('button', /guardar/i).click()
      cy.contains(/lugar.*es obligatorio/i).should('be.visible')

      // Llenar lugar
      cy.get('input').eq(1).type('Test Location')
      cy.contains('button', /guardar/i).click()
      cy.contains(/contexto.*es obligatorio/i).should('be.visible')
    })

    it('debe rechazar formatos de archivo inválidos', () => {
      cy.visit('/photos/upload')

      // Intentar subir PDF
      cy.get('input[type="file"]').selectFile(
        {
          contents: Cypress.Buffer.from('fake pdf'),
          fileName: 'documento.pdf',
          mimeType: 'application/pdf',
        },
        { force: true }
      )

      // Debe mostrar error
      cy.contains(/formato no válido/i, { timeout: 2000 }).should('be.visible')
    })
  })

  describe('Visualización y navegación de fotos', () => {
    beforeEach(() => {
      // Sembrar fotos de prueba
      const mockPhotos = [
        {
          id: '1',
          fileName: 'cumpleaños-abuela.jpg',
          people: 'Abuela Rosa, Mamá, Papá',
          location: 'Casa familiar',
          context: 'Cumpleaños 80 de la abuela',
          uploadDate: '2025-01-15T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
        {
          id: '2',
          fileName: 'navidad-2024.jpg',
          people: 'Toda la familia',
          location: 'Sala de la casa',
          context: 'Celebración de Navidad 2024',
          uploadDate: '2025-01-20T15:30:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
      ]
      cy.seedPhotos(mockPhotos)
    })

    it('debe mostrar todas las fotos en la galería', () => {
      cy.visit('/photos')

      // Verificar que no hay mensaje de estado vacío
      cy.contains(/no hay imágenes cargadas/i).should('not.exist')

      // Verificar que ambas fotos están presentes
      cy.contains('cumpleaños-abuela.jpg').should('be.visible')
      cy.contains('navidad-2024.jpg').should('be.visible')

      // Verificar información de las fotos
      cy.contains(/abuela rosa/i).should('be.visible')
      cy.contains(/casa familiar/i).should('be.visible')
    })

    it('debe abrir modal de detalles al hacer click en una foto', () => {
      cy.visit('/photos')

      // Click en la primera foto
      cy.contains('cumpleaños-abuela.jpg').click()

      // Verificar que el modal se abre
      cy.contains(/personas en la foto/i).should('be.visible')
      cy.contains(/ubicación/i).should('be.visible')
      cy.contains(/contexto/i).should('be.visible')

      // Verificar que muestra información completa
      cy.contains('Cumpleaños 80 de la abuela').should('be.visible')
    })

    it('debe cerrar modal de detalles al hacer click en X', () => {
      cy.visit('/photos')

      // Abrir modal
      cy.contains('cumpleaños-abuela.jpg').click()
      cy.contains(/personas en la foto/i).should('be.visible')

      // Cerrar con X
      cy.get('button').contains('X').click()

      // Verificar que el modal se cerró
      cy.contains(/personas en la foto/i).should('not.exist')
    })

    it('debe tener botón de Nueva Imagen siempre visible', () => {
      cy.visit('/photos')

      cy.contains('button', /nueva imagen/i).should('be.visible')
      cy.contains('button', /nueva imagen/i).click()

      cy.url().should('include', '/photos/upload')
    })
  })

  describe('Edición de fotos', () => {
    beforeEach(() => {
      const mockPhotos = [
        {
          id: 'edit-test-id',
          fileName: 'para-editar.jpg',
          people: 'Usuario Original',
          location: 'Lugar Original',
          context: 'Contexto Original',
          uploadDate: '2025-01-15T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
      ]
      cy.seedPhotos(mockPhotos)
    })

    it('debe permitir editar información de una foto', () => {
      cy.visit('/photos')

      // Click en Editar
      cy.contains('button', /editar/i).first().click()

      // Verificar que estamos en la página de edición
      cy.url().should('include', '/photos/edit/')
      cy.contains('h1', /editar imagen/i).should('be.visible')

      // Verificar que los campos están prellenados
      cy.get('input').eq(0).should('have.value', 'Usuario Original')
      cy.get('input').eq(1).should('have.value', 'Lugar Original')
      cy.get('textarea').should('have.value', 'Contexto Original')

      // Modificar datos
      cy.get('input').eq(0).clear().type('Usuario Editado')
      cy.get('input').eq(1).clear().type('Nuevo Lugar')
      cy.get('textarea').clear().type('Contexto actualizado con más detalles')

      // Guardar cambios
      cy.contains('button', /actualizar/i).click()

      // Verificar mensaje de éxito
      cy.contains(/cambios guardados/i, { timeout: 3000 }).should('be.visible')

      // Verificar que volvemos a la lista
      cy.url().should('include', '/photos')
      cy.url().should('not.include', '/edit')

      // Verificar que los cambios se aplicaron
      cy.contains('Usuario Editado').should('be.visible')
      cy.contains('Nuevo Lugar').should('be.visible')
    })

    it('debe permitir cancelar la edición', () => {
      cy.visit('/photos')

      cy.contains('button', /editar/i).first().click()

      // Modificar datos
      cy.get('input').eq(0).clear().type('No debería guardarse')

      // Cancelar
      cy.contains('button', /cancelar/i).click()

      // Verificar que volvemos a la lista
      cy.url().should('include', '/photos')
      cy.url().should('not.include', '/edit')

      // Verificar que los datos no cambiaron
      cy.contains('Usuario Original').should('be.visible')
      cy.contains('No debería guardarse').should('not.exist')
    })
  })

  describe('Eliminación de fotos', () => {
    beforeEach(() => {
      const mockPhotos = [
        {
          id: 'delete-test-1',
          fileName: 'para-eliminar-1.jpg',
          people: 'Test User 1',
          location: 'Test Location 1',
          context: 'Test Context 1',
          uploadDate: '2025-01-15T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
        {
          id: 'delete-test-2',
          fileName: 'para-eliminar-2.jpg',
          people: 'Test User 2',
          location: 'Test Location 2',
          context: 'Test Context 2',
          uploadDate: '2025-01-16T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
      ]
      cy.seedPhotos(mockPhotos)
    })

    it('debe abrir modal de confirmación al intentar eliminar', () => {
      cy.visit('/photos')

      // Click en Eliminar
      cy.contains('button', /eliminar/i).first().click()

      // Verificar que el modal aparece
      cy.contains(/confirmar eliminación/i).should('be.visible')
      cy.contains(/esta acción no se puede deshacer/i).should('be.visible')
      cy.contains('para-eliminar-1.jpg').should('be.visible')
    })

    it('debe eliminar foto al confirmar', () => {
      cy.visit('/photos')

      // Verificar que tenemos 2 fotos
      cy.contains('para-eliminar-1.jpg').should('be.visible')
      cy.contains('para-eliminar-2.jpg').should('be.visible')

      // Eliminar primera foto
      cy.contains('para-eliminar-1.jpg')
        .parent()
        .parent()
        .parent()
        .find('button')
        .contains(/eliminar/i)
        .click()

      // Confirmar eliminación
      cy.contains('button', /eliminar/i).last().click()

      // Verificar mensaje de éxito
      cy.contains(/eliminada exitosamente/i, { timeout: 3000 }).should(
        'be.visible'
      )

      // Verificar que la foto fue eliminada
      cy.contains('para-eliminar-1.jpg').should('not.exist')

      // Verificar que la otra foto sigue presente
      cy.contains('para-eliminar-2.jpg').should('be.visible')
    })

    it('debe cancelar eliminación al hacer click en Cancelar', () => {
      cy.visit('/photos')

      // Click en Eliminar
      cy.contains('button', /eliminar/i).first().click()

      // Cancelar
      cy.contains('button', /cancelar/i).click()

      // El modal debe cerrarse
      cy.contains(/confirmar eliminación/i).should('not.exist')

      // La foto debe seguir presente
      cy.contains('para-eliminar-1.jpg').should('be.visible')
    })
  })

  describe('Galería del paciente', () => {
    beforeEach(() => {
      const mockPhotos = [
        {
          id: '1',
          fileName: 'foto1.jpg',
          people: 'Familia',
          location: 'Casa',
          context: 'Reunión',
          uploadDate: '2025-01-10T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
        {
          id: '2',
          fileName: 'foto2.jpg',
          people: 'Amigos',
          location: 'Parque',
          context: 'Paseo',
          uploadDate: '2025-01-15T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
        {
          id: '3',
          fileName: 'foto3.jpg',
          people: 'Hermanos',
          location: 'Playa',
          context: 'Vacaciones',
          uploadDate: '2025-01-20T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
      ]
      cy.seedPhotos(mockPhotos)
    })

    it('debe mostrar carrusel de fotos para el paciente', () => {
      cy.visit('/photos/patient')

      // Verificar título
      cy.contains(/tus recuerdos/i).should('be.visible')

      // Verificar que hay fotos
      cy.contains(/1/).should('be.visible') // Contador

      // Verificar botones de navegación
      cy.get('button').contains('ChevronLeft').should('exist')
      cy.get('button').contains('ChevronRight').should('exist')
    })

    it('debe permitir navegar entre fotos con los botones', () => {
      cy.visit('/photos/patient')

      // Verificar que estamos en la primera foto (1/3)
      cy.contains('1').should('be.visible')

      // Click en siguiente
      cy.get('button[class*="right"]').click()

      // Verificar que avanzó (2/3)
      cy.contains('2').should('be.visible')

      // Click en siguiente nuevamente
      cy.get('button[class*="right"]').click()

      // Verificar (3/3)
      cy.contains('3').should('be.visible')

      // Click en anterior
      cy.get('button[class*="left"]').click()

      // Debería volver a 2
      cy.contains('2').should('be.visible')
    })

    it('debe abrir vista ampliada al hacer click en foto', () => {
      cy.visit('/photos/patient')

      // Click en la foto del centro
      cy.get('img[alt*="foto"]').first().click()

      // Verificar que se abre vista ampliada (fondo negro)
      cy.get('div[class*="bg-black"]').should('be.visible')

      // Verificar controles de zoom
      cy.get('button').contains('Plus').should('exist')
      cy.get('button').contains('Minus').should('exist')
    })
  })

  describe('Responsive design', () => {
    it('debe funcionar correctamente en móvil', () => {
      cy.viewport('iphone-x')

      cy.seedPhotos([
        {
          id: '1',
          fileName: 'mobile-test.jpg',
          people: 'Test',
          location: 'Test',
          context: 'Test',
          uploadDate: '2025-01-15T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
      ])

      cy.visit('/photos')

      // Verificar que la foto se muestra
      cy.contains('mobile-test.jpg').should('be.visible')

      // Verificar que los botones son accesibles
      cy.contains('button', /editar/i).should('be.visible')
      cy.contains('button', /eliminar/i).should('be.visible')
    })

    it('debe funcionar correctamente en tablet', () => {
      cy.viewport('ipad-2')

      cy.visit('/photos')

      cy.contains(/imágenes familiares/i).should('be.visible')
      cy.contains('button', /nueva imagen/i).should('be.visible')
    })
  })
})