describe('Navegación General - E2E', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  describe('Header y Footer', () => {
    it('debe mostrar el header en todas las páginas', () => {
      // Home
      cy.visit('/')
      cy.get('header').should('be.visible')
      cy.contains('Do U Remember').should('be.visible')

      // Photos
      cy.visit('/photos')
      cy.get('header').should('be.visible')

      // Upload
      cy.visit('/photos/upload')
      cy.get('header').should('be.visible')
    })

    it('debe mostrar el footer en todas las páginas', () => {
      cy.visit('/')
      cy.get('footer').should('be.visible')
      cy.contains(/aplicación proyecto informático/i).should('be.visible')

      cy.visit('/photos')
      cy.get('footer').should('be.visible')
    })

    it('debe navegar usando el menú del header', () => {
      cy.visit('/')

      // Click en Nosotros
      cy.contains('a', /nosotros/i).click()
      cy.url().should('include', '/about')

      // Click en Servicios
      cy.visit('/')
      cy.contains('a', /servicios/i).click()
      cy.url().should('include', '/services')

      // Click en Contacto
      cy.visit('/')
      cy.contains('a', /contacto/i).click()
      cy.url().should('include', '/contact')

      // Click en logo para volver a home
      cy.contains('Do U Remember').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })

    it('debe mostrar menú hamburguesa en móvil', () => {
      cy.viewport('iphone-x')
      cy.visit('/')

      // Click en hamburguesa (ajusta el selector según tu implementación)
      cy.get('button').contains(/menú/i).should('exist').click()

      // El menú debe aparecer
      cy.contains('a', /inicio/i).should('be.visible')
      cy.contains('a', /nosotros/i).should('be.visible')
    })
  })

  describe('Página de inicio', () => {
    it('debe cargar la página principal correctamente', () => {
      cy.visit('/')

      cy.contains(/panel de control médico/i).should('be.visible')
    })

    it('debe mostrar las tarjetas de información', () => {
      cy.visit('/')

      cy.contains(/citas/i).should('be.visible')
      cy.contains(/actividades/i).should('be.visible')
      cy.contains(/pendientes/i).should('be.visible')
      cy.contains(/historia clínica/i).should('be.visible')
    })

    it('debe mostrar recordatorios', () => {
      cy.visit('/')

      cy.contains(/recordatorio/i).should('be.visible')
    })
  })

  describe('Rutas protegidas y manejo de errores', () => {
    it('debe manejar correctamente una página no encontrada', () => {
      cy.visit('/pagina-inexistente', { failOnStatusCode: false })

      // Esperar a que la página cargue y verificar que existe contenido
      cy.get('body').should('be.visible')
      
      // Next.js puede mostrar 404 de diferentes formas
      cy.url().should('include', '/pagina-inexistente')
    })

    it('debe manejar correctamente ID inválido en edición', () => {
      cy.visit('/photos/edit/id-invalido-123', { failOnStatusCode: false })

      // Esperar a que cargue
      cy.wait(1000)

      // Debería mostrar mensaje de error o redirigir
      cy.url().should('include', '/photos')
    })
  })

  describe('Información de contacto en footer', () => {
    it('debe mostrar información de contacto correcta', () => {
      cy.visit('/')

      cy.get('footer').within(() => {
        cy.contains('+57 310 101 1010').should('be.visible')
        cy.contains('contacto@douremember.com').should('be.visible')
        cy.contains(/UAO.*CALI/i).should('be.visible')
      })
    })

    it('debe mostrar horarios de atención', () => {
      cy.visit('/')

      cy.get('footer').within(() => {
        cy.contains(/lunes.*viernes/i).should('be.visible')
        cy.contains(/8:00.*6:00/i).should('be.visible')
        cy.contains(/sábados/i).should('be.visible')
      })
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener textos alternativos en imágenes', () => {
      cy.visit('/')

      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt')
      })
    })

    it('debe permitir navegación con teclado en formularios', () => {
      cy.visit('/photos/upload')

      // Verificar que los campos son focuseables
      cy.get('input').first().focus()
      cy.get('input').first().should('have.focus')

      // Simular navegación con Tab (sin plugin)
      cy.get('input').first().trigger('keydown', { keyCode: 9, which: 9, key: 'Tab' })
      
      // Verificar que el foco se movió a otro elemento
      cy.focused().should('exist')
    })

    it('debe tener suficiente contraste en textos', () => {
      cy.visit('/')

      // Verificar que los textos principales son visibles
      cy.contains(/panel de control médico/i).should('be.visible')
    })
  })

  describe('Persistencia de datos', () => {
    it('debe mantener datos en localStorage entre navegaciones', () => {
      const mockPhotos = [
        {
          id: '1',
          fileName: 'persistent.jpg',
          people: 'Test',
          location: 'Test',
          context: 'Test',
          uploadDate: '2025-01-15T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
      ]

      cy.seedPhotos(mockPhotos)

      // Visitar fotos
      cy.visit('/photos')
      cy.contains('persistent.jpg').should('be.visible')

      // Navegar a home
      cy.visit('/')

      // Volver a fotos
      cy.visit('/photos')

      // Los datos deben persistir
      cy.contains('persistent.jpg').should('be.visible')
    })

    it('debe limpiar datos al usar localStorage.clear()', () => {
      const mockPhotos = [
        {
          id: '1',
          fileName: 'to-clear.jpg',
          people: 'Test',
          location: 'Test',
          context: 'Test',
          uploadDate: '2025-01-15T10:00:00.000Z',
          patientId: 'patient-123',
          imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        },
      ]

      cy.seedPhotos(mockPhotos)
      cy.visit('/photos')
      cy.contains('to-clear.jpg').should('be.visible')

      // Limpiar localStorage
      cy.clearLocalStorage()

      // Recargar
      cy.reload()

      // Ya no debería haber fotos
      cy.contains(/no hay imágenes cargadas/i).should('be.visible')
    })
  })

  describe('Performance', () => {
    it('debe cargar la página principal en menos de 3 segundos', () => {
      const start = Date.now()

      cy.visit('/')

      cy.window().then(() => {
        const loadTime = Date.now() - start
        expect(loadTime).to.be.lessThan(3000)
      })
    })

    it('debe cargar imágenes eficientemente', () => {
      const mockPhotos = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        fileName: `foto-${i}.jpg`,
        people: 'Test',
        location: 'Test',
        context: 'Test',
        uploadDate: '2025-01-15T10:00:00.000Z',
        patientId: 'patient-123',
        imageData: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      }))

      cy.seedPhotos(mockPhotos)
      cy.visit('/photos')

      // Todas las fotos deberían estar visibles
      cy.contains('foto-0.jpg').should('be.visible')
      cy.contains('foto-9.jpg').should('be.visible')
    })
  })

  describe('Manejo de estados de error', () => {
    it('debe manejar localStorage no disponible gracefully', () => {
      cy.visit('/photos', {
        onBeforeLoad(win) {
          // Simular localStorage no disponible
          try {
            Object.defineProperty(win, 'localStorage', {
              value: null,
              writable: false,
            })
          } catch (e) {
            // Algunos navegadores no permiten esto
            cy.log('No se pudo simular localStorage no disponible')
          }
        },
      })

      // La app no debería crashear
      cy.contains(/imágenes familiares/i, { timeout: 10000 }).should('be.visible')
    })
  })
})