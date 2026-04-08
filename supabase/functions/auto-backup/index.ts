// supabase/functions/auto-backup/index.ts
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // 1. Configuración del cliente con privilegios de admin
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 2. La API Key de Resend (la ponemos como string directo para que no falle)
  const RESEND_API_KEY = 're_7qCvp4xJ_KdeQ61UVrW9J9tFBj3wyDbsG'

  try {
    console.log("Iniciando proceso de respaldo...")

    // 3. Jalar los datos de todas tus tablas
    const { data: avisos } = await supabase.from('AVISO').select('*')
    const { data: documentos } = await supabase.from('DOCUMENTO').select('*')
    const { data: usuarios } = await supabase.from('usuario').select('*')
    const { data: config } = await supabase.from('configuracion_sistema').select('*')

    const backup = { 
      AVISO: avisos, 
      DOCUMENTO: documentos, 
      usuario: usuarios,
      configuracion: config,
      fecha_generacion: new Date().toISOString()
    }
    
    const fecha = new Date().toISOString().split('T')[0]
    const nombreArchivo = `backup_${fecha}_${Date.now()}.json`
    const backupString = JSON.stringify(backup, null, 2)

    // 4. Subir al Storage (Bucket: backups)
    console.log("Subiendo archivo al storage...")
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(nombreArchivo, backupString, {
        contentType: 'application/json',
        upsert: true
      })

    if (uploadError) {
      console.error("Error en Storage:", uploadError.message)
      throw uploadError
    }

    // 5. ENVIAR POR CORREO vía Resend
    console.log("Enviando email...")
    const resEmail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Respaldo Sistema <onboarding@resend.dev>',
        to: ['tic-310009@utnay.edu.mx'], 
        subject: `✅ Respaldo Exitoso - ${fecha}`,
        html: `
          <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #2e7d32;">¡Respaldo Completado!</h2>
            <p>El sistema ha generado un nuevo punto de restauración correctamente.</p>
            <hr />
            <p><strong>Detalles:</strong></p>
            <ul>
              <li><strong>Archivo:</strong> ${nombreArchivo}</li>
              <li><strong>Estado:</strong> Guardado en Storage y Adjunto</li>
            </ul>
          </div>
        `,
        attachments: [
          {
            filename: nombreArchivo,
            content: btoa(backupString), // Base64 necesario para adjuntos
          },
        ],
      }),
    })

    const emailStatus = await resEmail.text()
    console.log("Respuesta de Resend:", emailStatus)

    return new Response(JSON.stringify({ ok: true, msg: "Proceso completado" }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    })

  } catch (err) {
    console.error("Error fatal:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    })
  }
})