# UX Guidelines — Product AI SUGUS

## Principios de diseño

- **Claridad sobre brevedad**: Los labels deben describir la acción, no acortarla.
- **Feedback inmediato**: Toda acción del usuario debe tener respuesta visual en < 200ms.
- **Progressive disclosure**: Mostrar solo la información necesaria en cada paso del flujo.

## Componentes

### Botones primarios
Usar `<md-filled-button>` para la acción principal de cada vista.
Solo puede haber un botón primario visible por pantalla.

### Formularios
- Labels siempre visibles (no usar solo placeholders).
- Validación inline al perder foco (`blur`), no al enviar.
- Mensajes de error en rojo (#B3261E) con ícono de advertencia.

## Flujos principales

### Product Brief
1. El usuario ingresa nombre del producto y descripción.
2. Claude genera el brief con secciones: Problema, Solución, Audiencia, KPIs.
3. El usuario puede editar secciones individualmente.
4. Exportar como PDF o copiar al portapapeles.

### Feature Ideation
1. Partir del brief existente (si hay uno).
2. Generar 5-10 ideas con título, descripción corta y prioridad estimada.
3. El usuario puede marcar favoritas y agregar notas.

## Tokens de diseño (Material You)

| Token | Valor |
|-------|-------|
| `--md-sys-color-primary` | #6750A4 |
| `--md-sys-color-surface` | #FFFBFE |
| `--md-sys-color-error` | #B3261E |
| Tipografía principal | Roboto 16px / 1.5 line-height |
