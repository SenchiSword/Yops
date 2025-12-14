// Gestion des patients

// Variables globales
let isEditingPatient = false;
let currentEditingPatientId = null;
let currentPatientPageId = null;
// NOTE: 'storage' sera défini via initPatients()

// Fonction pour formater la date en format français (jj/mm/aaaa)
function formatFrenchDate(dateString) {
    if (!dateString) return 'Non renseigné';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Initialiser la gestion des patients
function initPatients(storageInstance) {
    window.storage = storageInstance; // Stockage global
}

// Fonction de soumission du formulaire patient
function handlePatientFormSubmit(e) {
    e.preventDefault();
    e.stopImmediatePropagation(); // Empêche d'autres écouteurs
    
    if (!window.storage) return;
    
    const submitFormBtn = document.getElementById('submitFormBtn');
    const patientForm = document.getElementById('patientForm');
    const formInputs = patientForm.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    formInputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#e74c3c';
            input.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
        } else {
            input.style.borderColor = '#d0ddec';
            input.style.boxShadow = 'none';
        }
    });
    
    if (!document.getElementById('consentement').checked) {
        alert('Veuillez accepter les conditions de traitement des données.');
        return;
    }
    
    if (isValid) {
        submitFormBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        submitFormBtn.disabled = true;
        
        setTimeout(() => {
            const patientData = {
                id: isEditingPatient ? currentEditingPatientId : getNextPatientId(window.storage),
                prenom: document.getElementById('prenom').value,
                nom: document.getElementById('nom').value,
                cinPasseport: document.getElementById('cin_passeport').value,
                age: document.getElementById('age').value,
                dateNaissance: document.getElementById('date-naissance').value,
                situation: document.getElementById('situation').value,
                telephone: document.getElementById('telephone').value,
                email: document.getElementById('email').value,
                adresse: document.getElementById('adresse').value,
                profession: document.getElementById('profession').value,
                motif: document.getElementById('motif').value,
                dentsConcernees: document.getElementById('dents-concernees').value || '',
                premiereConsultation: document.getElementById('premiere-consultation').value,
                contactUrgenceNom: document.getElementById('contact-urgence-nom').value,
                lienParente: document.getElementById('lien-parente').value,
                telUrgence: document.getElementById('tel-urgence').value,
                notes: document.getElementById('notes').value,
                tabac: isEditingPatient ? document.getElementById('tabac').value : '',
                alcool: isEditingPatient ? document.getElementById('alcool').value : '',
                cafeThe: isEditingPatient ? document.getElementById('cafe-the').value : '',
                niveauStress: isEditingPatient ? document.getElementById('niveau-stress').value : '',
                sommeil: isEditingPatient ? document.getElementById('sommeil').value : '',
                // Nouveaux champs pour les antécédents médicaux
                allergies: isEditingPatient ? document.getElementById('allergies').value : '',
                maladiesCardiaques: isEditingPatient ? document.getElementById('maladies-cardiaques').value : '',
                hypertension: isEditingPatient ? document.getElementById('hypertension').value : '',
                diabete: isEditingPatient ? document.getElementById('diabete').value : '',
                troublesCoagulation: isEditingPatient ? document.getElementById('troubles-coagulation').value : '',
                maladiesInfectieuses: isEditingPatient ? document.getElementById('maladies-infectieuses').value : '',
                traitementCours: isEditingPatient ? document.getElementById('traitement-cours').value : '',
                grossesse: isEditingPatient ? document.getElementById('grossesse').value : '',
                antecedentsDetails: isEditingPatient ? document.getElementById('antecedents-details').value : '',
                dateAjout: isEditingPatient ? window.storage.getPatientById(currentEditingPatientId).dateAjout : new Date().toISOString().split('T')[0],
                statut: isEditingPatient ? (window.storage.getPatientById(currentEditingPatientId).statut || 'Actif') : 'Actif'
            };
            
            if (isEditingPatient) {
                window.storage.updatePatient(patientData);
                alert(`Patient ${patientData.prenom} ${patientData.nom} mis à jour avec succès !\nCIN/Passeport: ${patientData.cinPasseport}`);
            } else {
                window.storage.addPatient(patientData);
                alert(`Patient ${patientData.prenom} ${patientData.nom} ajouté avec succès !\nID: ${formatPatientIdForDisplay(patientData.id)}\nCIN/Passeport: ${patientData.cinPasseport}`);
            }
            
            submitFormBtn.innerHTML = isEditingPatient ? 
                '<i class="fas fa-save"></i> Mettre à jour le patient' : 
                '<i class="fas fa-save"></i> Enregistrer le nouveau patient';
            submitFormBtn.disabled = false;
            
            closePatientFormModal();
            patientForm.reset();
            
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('premiere-consultation').value = today;
            
            // Réinitialiser les menus déroulants
            document.getElementById('tabac').value = '';
            document.getElementById('alcool').value = '';
            document.getElementById('cafe-the').value = '';
            document.getElementById('niveau-stress').value = '';
            document.getElementById('sommeil').value = '';
            
            // Réinitialiser les menus déroulants des antécédents
            document.getElementById('allergies').value = '';
            document.getElementById('maladies-cardiaques').value = '';
            document.getElementById('hypertension').value = '';
            document.getElementById('diabete').value = '';
            document.getElementById('troubles-coagulation').value = '';
            document.getElementById('maladies-infectieuses').value = '';
            document.getElementById('traitement-cours').value = '';
            document.getElementById('grossesse').value = '';
            document.getElementById('antecedents-details').value = '';
            
            // Mettre à jour l'interface
            if (typeof updateDashboard === 'function') updateDashboard();
            if (typeof displayRecentPatients === 'function') displayRecentPatients();
            if (typeof displayAllPatients === 'function') displayAllPatients();
            
            if (document.getElementById('patientsListContent').style.display !== 'none') {
                if (typeof showPatientsList === 'function') showPatientsList();
            }
            
            // Si on est sur la page patient, la mettre à jour
            if (currentPatientPageId && currentPatientPageId === patientData.id) {
                if (typeof showPatientPage === 'function') showPatientPage(patientData.id);
            }
        }, 1000);
    } else {
        alert('Veuillez remplir tous les champs obligatoires (marqués d\'un *).');
    }
}

// Fonction pour afficher la page patient avec onglets
function showPatientPage(patientId) {
    if (!window.storage) return;
    
    const patient = window.storage.getPatientById(patientId);
    if (!patient) return;
    
    currentPatientPageId = patientId;
    
    // Masquer les autres contenus
    document.getElementById('dashboardContent').style.display = 'none';
    document.getElementById('patientsListContent').style.display = 'none';
    document.getElementById('appointmentsContent').style.display = 'none';
    document.getElementById('usersContent').style.display = 'none';
    document.getElementById('patientPage').style.display = 'block';
    
    // Mettre à jour le titre de la page
    document.getElementById('pageTitle').textContent = 'Fiche Patient';
    document.getElementById('pageSubtitle').textContent = 'Gestion complète du patient';
    
    // Mettre à jour l'en-tête avec les modifications demandées
    const initials = (patient.prenom ? patient.prenom[0] : '') + (patient.nom ? patient.nom[0] : '');
    document.getElementById('patientPageAvatar').textContent = initials.toUpperCase();
    document.getElementById('patientPageName').textContent = `${patient.prenom} ${patient.nom}`;
    document.getElementById('patientPageId').textContent = formatPatientIdForDisplay(patient.id);
    
    // Remplacer "Profession" par "Date de naissance" + "Âge" côte à côte
    document.getElementById('patientPageProfession').innerHTML = `
        <div class="birthdate-age-container">
            <div class="birthdate-item">
                <i class="fas fa-birthday-cake"></i>
                <span>${formatFrenchDate(patient.dateNaissance)}</span>
            </div>
            <div class="birthdate-age-separator"></div>
            <div class="age-item">
                <i class="fas fa-user-clock"></i>
                <span>${patient.age || '0'} ans</span>
            </div>
        </div>
    `;
    
    document.getElementById('patientPageStatus').textContent = patient.statut || 'Actif';
    
    // MODIFICATION: Ajouter la ligne d'informations supplémentaires sous l'ID avec email sous l'adresse
    const infoLine = `
        <div class="patient-info-line">
            <div class="info-item-small">
                <i class="fas fa-home"></i>
                <span>${patient.adresse || 'Adresse non renseignée'}</span>
            </div>
            ${patient.email ? `
            <div class="info-item-small">
                <i class="fas fa-envelope"></i>
                <span>${patient.email}</span>
            </div>` : ''}
            <div class="info-item-small">
                <i class="fas fa-phone"></i>
                <span>${patient.telephone}</span>
            </div>
        </div>
    `;
    
    // Insérer la ligne d'informations après l'ID
    const idElement = document.getElementById('patientPageId');
    if (idElement.nextElementSibling && idElement.nextElementSibling.classList.contains('patient-info-line')) {
        idElement.nextElementSibling.remove();
    }
    idElement.insertAdjacentHTML('afterend', infoLine);
    
    // Mettre à jour la dernière visite
    const appointments = window.storage.getAppointmentsByPatient(patientId);
    const lastAppointment = appointments
        .filter(a => a.status === 'Terminé')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    if (lastAppointment) {
        document.getElementById('patientPageLastVisit').textContent = 
            `Dernière visite: ${formatShortDate(lastAppointment.date)}`;
    } else {
        document.getElementById('patientPageLastVisit').textContent = 'Aucune visite';
    }
    
    // Charger le contenu de l'onglet Informations
    loadPatientInformations(patient);
    
    // Charger les actes du patient
    if (typeof loadPatientActs === 'function') {
        loadPatientActs(patientId);
    }
    
    // Activer l'onglet Informations par défaut
    activateTab('informations');
}

// Fonction pour charger les informations du patient
function loadPatientInformations(patient) {
    let html = `
        <div class="patient-info-form photo-layout">
            <!-- Section principale - Informations personnelles -->
            <div class="personal-info-section">
                <!-- Colonne gauche -->
                <div class="info-column-left">
                    <!-- Bloc Informations personnelles -->
                    <div class="info-block">
                        <div class="info-block-header">
                            <i class="fas fa-user-circle"></i>
                            <h3>Informations personnelles</h3>
                        </div>
                        <div class="info-grid-two-col">
                            <div class="info-item">
                                <div class="info-label">CIN / Passeport</div>
                                <div class="info-value">${patient.cinPasseport || 'Non renseigné'}</div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">Âge</div>
                                <div class="info-value">${patient.age} ans</div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">Date de naissance</div>
                                <div class="info-value">${formatFrenchDate(patient.dateNaissance)}</div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">Situation familiale</div>
                                <div class="info-value">${patient.situation || 'Non renseigné'}</div>
                            </div>
                        </div>
                        
                        <div class="info-separator"></div>
                        
                        <div class="info-item">
                            <div class="info-label">Profession</div>
                            <div class="info-value">${patient.profession || 'Non renseigné'}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">Date inscription</div>
                            <div class="info-value">${formatFrenchDate(patient.dateAjout)}</div>
                        </div>
                    </div>
                    
                    <!-- Bloc Contact d'urgence -->
                    <div class="info-block">
                        <div class="info-block-header">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>Contact d'urgence</h3>
                        </div>
                        <div class="info-grid-one-col">
                            <div class="info-item">
                                <div class="info-label">Nom et prénom</div>
                                <div class="info-value">${patient.contactUrgenceNom || 'Non renseigné'}</div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">Lien de parenté</div>
                                <div class="info-value">${patient.lienParente || 'Non renseigné'}</div>
                            </div>
                            
                            <div class="info-item">
                                <div class="info-label">Téléphone d'urgence</div>
                                <div class="info-value">${patient.telUrgence || 'Non renseigné'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Colonne droite -->
                <div class="info-column-right">
                    <!-- Bloc Informations de contact -->
                    <div class="info-block">
                        <div class="info-block-header">
                            <i class="fas fa-address-card"></i>
                            <h3>Informations de contact</h3>
                        </div>
                        <div class="info-grid-one-col">
                            <div class="info-item">
                                <div class="info-label">Téléphone</div>
                                <div class="info-value">${patient.telephone}</div>
                            </div>
                            
                            <!-- MODIFICATION: Supprimer l'email de cette section car il est maintenant dans l'en-tête -->
                            <!--
                            <div class="info-item">
                                <div class="info-label">Email</div>
                                <div class="info-value">${patient.email || 'Non renseigné'}</div>
                            </div>
                            -->
                            
                            <div class="info-item">
                                <div class="info-label">Adresse</div>
                                <div class="info-value">${patient.adresse}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bloc Motif de consultation -->
                    <div class="info-block">
                        <div class="info-block-header">
                            <i class="fas fa-notes-medical"></i>
                            <h3>Motif de consultation</h3>
                        </div>
                        <div class="info-grid-one-col">
                            <div class="info-item">
                                <div class="info-label">Raison de consultation</div>
                                <div class="info-value">${patient.motif}</div>
                            </div>
                            
                            ${patient.dentsConcernees ? `
                            <div class="info-item">
                                <div class="info-label">Dents concernées</div>
                                <div class="info-value">${patient.dentsConcernees}</div>
                            </div>` : ''}
                            
                            <div class="info-item">
                                <div class="info-label">Date 1ère consultation</div>
                                <div class="info-value">${formatFrenchDate(patient.premiereConsultation)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    `;
    
    // Ajouter les habitudes de vie si elles existent (VERSION COMPACTE)
    if (patient.tabac || patient.alcool || patient.cafeThe || patient.niveauStress || patient.sommeil) {
        html += `
            <!-- Bloc Habitudes de vie (version compacte) -->
            <div class="info-block habits-info-block compact">
                <div class="info-block-header">
                    <i class="fas fa-heartbeat"></i>
                    <h3>Habitudes de vie</h3>
                </div>
                <div class="habits-grid-compact">
                    ${patient.tabac ? `
                    <div class="habit-item-compact">
                        <div class="habit-label-compact">Tabac</div>
                        <div class="habit-value-compact">${patient.tabac}</div>
                    </div>` : ''}
                    
                    ${patient.alcool ? `
                    <div class="habit-item-compact">
                        <div class="habit-label-compact">Alcool</div>
                        <div class="habit-value-compact">${patient.alcool}</div>
                    </div>` : ''}
                    
                    ${patient.cafeThe ? `
                    <div class="habit-item-compact">
                        <div class="habit-label-compact">Café/Thé</div>
                        <div class="habit-value-compact">${patient.cafeThe}</div>
                    </div>` : ''}
                    
                    ${patient.niveauStress ? `
                    <div class="habit-item-compact">
                        <div class="habit-label-compact">Stress</div>
                        <div class="habit-value-compact">${patient.niveauStress}</div>
                    </div>` : ''}
                    
                    ${patient.sommeil ? `
                    <div class="habit-item-compact">
                        <div class="habit-label-compact">Sommeil</div>
                        <div class="habit-value-compact">${patient.sommeil}</div>
                    </div>` : ''}
                </div>
            </div>
        `;
    }
    
    // Ajouter les antécédents médicaux si ils existent (VERSION COMPACTE)
    const antecedentsItems = [];
    if (patient.allergies && patient.allergies !== '') antecedentsItems.push({ label: 'Allergies', value: patient.allergies });
    if (patient.maladiesCardiaques && patient.maladiesCardiaques !== '') antecedentsItems.push({ label: 'Maladies cardiaques', value: patient.maladiesCardiaques });
    if (patient.hypertension && patient.hypertension !== '') antecedentsItems.push({ label: 'Hypertension artérielle', value: patient.hypertension });
    if (patient.diabete && patient.diabete !== '') antecedentsItems.push({ label: 'Diabète', value: patient.diabete });
    if (patient.troublesCoagulation && patient.troublesCoagulation !== '') antecedentsItems.push({ label: 'Troubles de coagulation', value: patient.troublesCoagulation });
    if (patient.maladiesInfectieuses && patient.maladiesInfectieuses !== '') antecedentsItems.push({ label: 'Maladies infectieuses', value: patient.maladiesInfectieuses });
    if (patient.traitementCours && patient.traitementCours !== '') antecedentsItems.push({ label: 'Traitement médical en cours', value: patient.traitementCours });
    if (patient.grossesse && patient.grossesse !== '' && patient.grossesse !== 'Non applicable') antecedentsItems.push({ label: 'Grossesse', value: patient.grossesse });

    if (antecedentsItems.length > 0 || patient.antecedentsDetails) {
        html += `
            <!-- Bloc Antécédents médicaux (version compacte) -->
            <div class="info-block habits-info-block compact">
                <div class="info-block-header">
                    <i class="fas fa-file-medical"></i>
                    <h3>Antécédents médicaux</h3>
                </div>
        `;
        
        if (antecedentsItems.length > 0) {
            html += `
                <div class="habits-grid-compact">
            `;
            
            antecedentsItems.forEach(item => {
                html += `
                    <div class="habit-item-compact">
                        <div class="habit-label-compact">${item.label}</div>
                        <div class="habit-value-compact ${getAntecedentValueClass(item.value)}">${item.value}</div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        if (patient.antecedentsDetails) {
            html += `
                <div style="margin-top: 15px;">
                    <div class="info-label" style="margin-bottom: 8px; font-size: 11px;">Détails des antécédents</div>
                    <div class="info-value" style="background-color: #f9fbff; border: 1px solid #e1e9f5; border-radius: 6px; padding: 10px; font-size: 12px; color: #444; line-height: 1.5;">
                        ${patient.antecedentsDetails.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    // Ajouter les notes si elles existent
    if (patient.notes) {
        html += `
            <!-- Bloc Notes supplémentaires -->
            <div class="info-block notes-info-block">
                <div class="info-block-header">
                    <i class="fas fa-sticky-note"></i>
                    <h3>Notes supplémentaires</h3>
                </div>
                <div class="info-value">
                    ${patient.notes.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    }
    
    html += `</div>`; // Fermer patient-info-form
    
    document.getElementById('informationsContent').innerHTML = html;
}

// Fonction utilitaire pour les icônes des antécédents
function getAntecedentIcon(label) {
    const icons = {
        'Allergies': 'allergies',
        'Maladies cardiaques': 'heartbeat',
        'Hypertension artérielle': 'tachometer-alt',
        'Diabète': 'syringe',
        'Troubles de coagulation': 'tint',
        'Maladies infectieuses': 'virus',
        'Traitement médical en cours': 'pills',
        'Grossesse': 'baby'
    };
    return icons[label] || 'stethoscope';
}

// Fonction pour la classe CSS selon la valeur
function getAntecedentValueClass(value) {
    if (value === 'Oui') return 'antecedent-yes';
    if (value === 'Non') return 'antecedent-no';
    return '';
}

// Fonction pour activer un onglet
function activateTab(tabName) {
    // Désactiver tous les onglets
    document.querySelectorAll('.patient-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Masquer tous les contenus
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activer l'onglet sélectionné
    const tabElement = document.querySelector(`.patient-tab[data-tab="${tabName}"]`);
    const contentElement = document.getElementById(`${tabName}Tab`);
    
    if (tabElement) tabElement.classList.add('active');
    if (contentElement) contentElement.classList.add('active');
    
    // Si on active l'onglet Acts, charger les actes
    if (tabName === 'acts' && typeof currentPatientPageId !== 'undefined' && currentPatientPageId) {
        if (typeof loadPatientActs === 'function') {
            loadPatientActs(currentPatientPageId);
        }
    }
}

// Fonction pour ouvrir le modal de formulaire patient
function openPatientFormModal() {
    isEditingPatient = false;
    currentEditingPatientId = null;
    
    document.getElementById('modalTitle').textContent = 'Formulaire de consultation - Nouveau patient';
    document.getElementById('formHeaderTitle').textContent = 'Formulaire de consultation - Informations complètes';
    document.getElementById('submitButtonText').textContent = 'Enregistrer le nouveau patient';
    
    // Masquer les sections des habitudes de vie et antécédents
    document.getElementById('habitsSection').style.display = 'none';
    document.getElementById('antecedentsSection').style.display = 'none';
    
    document.getElementById('patientModal').style.display = 'flex';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('premiere-consultation').value = today;
    
    document.getElementById('patientForm').reset();
    document.getElementById('patientId').value = '';
    
    // Réinitialiser les menus déroulants
    document.getElementById('tabac').value = '';
    document.getElementById('alcool').value = '';
    document.getElementById('cafe-the').value = '';
    document.getElementById('niveau-stress').value = '';
    document.getElementById('sommeil').value = '';
    
    // Réinitialiser les menus déroulants des antécédents
    document.getElementById('allergies').value = '';
    document.getElementById('maladies-cardiaques').value = '';
    document.getElementById('hypertension').value = '';
    document.getElementById('diabete').value = '';
    document.getElementById('troubles-coagulation').value = '';
    document.getElementById('maladies-infectieuses').value = '';
    document.getElementById('traitement-cours').value = '';
    document.getElementById('grossesse').value = '';
    document.getElementById('antecedents-details').value = '';
    
    const allInputs = document.getElementById('patientForm').querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.style.borderColor = '#d0ddec';
        input.style.boxShadow = 'none';
    });
}

// Fonction pour ouvrir le modal pour éditer un patient
function openEditPatientModal(patientId) {
    if (!window.storage) return;
    
    const patient = window.storage.getPatientById(patientId);
    if (!patient) return;
    
    isEditingPatient = true;
    currentEditingPatientId = patientId;
    
    document.getElementById('modalTitle').textContent = `Modification du patient - ${patient.prenom} ${patient.nom}`;
    document.getElementById('formHeaderTitle').textContent = `Modification des informations du patient`;
    document.getElementById('submitButtonText').textContent = 'Mettre à jour le patient';
    
    // Afficher les sections des habitudes de vie et antécédents
    document.getElementById('habitsSection').style.display = 'block';
    document.getElementById('antecedentsSection').style.display = 'block';
    
    // Remplir le formulaire avec les données du patient
    document.getElementById('patientId').value = patient.id;
    document.getElementById('prenom').value = patient.prenom || '';
    document.getElementById('nom').value = patient.nom || '';
    document.getElementById('cin_passeport').value = patient.cinPasseport || '';
    document.getElementById('age').value = patient.age || '';
    document.getElementById('date-naissance').value = patient.dateNaissance || '';
    document.getElementById('situation').value = patient.situation || '';
    document.getElementById('telephone').value = patient.telephone || '';
    document.getElementById('email').value = patient.email || '';
    document.getElementById('adresse').value = patient.adresse || '';
    document.getElementById('profession').value = patient.profession || '';
    document.getElementById('motif').value = patient.motif || '';
    document.getElementById('dents-concernees').value = patient.dentsConcernees || '';
    document.getElementById('premiere-consultation').value = patient.premiereConsultation || '';
    document.getElementById('contact-urgence-nom').value = patient.contactUrgenceNom || '';
    document.getElementById('lien-parente').value = patient.lienParente || '';
    document.getElementById('tel-urgence').value = patient.telUrgence || '';
    document.getElementById('notes').value = patient.notes || '';
    
    // Remplir les menus déroulants des habitudes
    document.getElementById('tabac').value = patient.tabac || '';
    document.getElementById('alcool').value = patient.alcool || '';
    document.getElementById('cafe-the').value = patient.cafeThe || '';
    document.getElementById('niveau-stress').value = patient.niveauStress || '';
    document.getElementById('sommeil').value = patient.sommeil || '';
    
    // Remplir les menus déroulants des antécédents
    document.getElementById('allergies').value = patient.allergies || '';
    document.getElementById('maladies-cardiaques').value = patient.maladiesCardiaques || '';
    document.getElementById('hypertension').value = patient.hypertension || '';
    document.getElementById('diabete').value = patient.diabete || '';
    document.getElementById('troubles-coagulation').value = patient.troublesCoagulation || '';
    document.getElementById('maladies-infectieuses').value = patient.maladiesInfectieuses || '';
    document.getElementById('traitement-cours').value = patient.traitementCours || '';
    document.getElementById('grossesse').value = patient.grossesse || '';
    document.getElementById('antecedents-details').value = patient.antecedentsDetails || '';
    
    document.getElementById('patientModal').style.display = 'flex';
}

// Fonction pour fermer le modal de formulaire patient
function closePatientFormModal() {
    document.getElementById('patientModal').style.display = 'none';
}

// Fonction pour afficher tous les patients (avec recherche)
function displayAllPatients(searchQuery = '') {
    if (!window.storage) return;
    
    const container = document.getElementById('allPatientsContainer');
    let patients;
    
    if (searchQuery) {
        patients = window.storage.searchPatients(searchQuery);
    } else {
        patients = window.storage.getPatients();
    }
    
    if (patients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-plus"></i>
                <h3>${searchQuery ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}</h3>
                <p>${searchQuery ? 'Essayez une autre recherche ou' : 'Commencez par ajouter votre premier patient en cliquant sur le bouton "Ajouter un patient".'}</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="patients-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>CIN/Passeport</th>
                    <th>Âge</th>
                    <th>Téléphone</th>
                    <th>Date d'inscription</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    patients.forEach(patient => {
        html += `
            <tr>
                <td>${formatPatientIdForDisplay(patient.id)}</td>
                <td>
                    <div class="patient-name">${patient.prenom} ${patient.nom}</div>
                    <div class="patient-id">${patient.profession}</div>
                </td>
                <td>${patient.cinPasseport || 'N/A'}</td>
                <td>${patient.age} ans</td>
                <td>${patient.telephone}</td>
                <td>${formatShortDate(patient.dateAjout)}</td>
                <td>
                    <span class="status-badge status-${patient.statut ? patient.statut.toLowerCase() : 'active'}">${patient.statut || 'Actif'}</span>
                </td>
                <td class="actions-cell">
                    <button class="btn btn-small btn-primary view-patient-btn" data-id="${patient.id}">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                    <button class="btn btn-small btn-edit edit-patient-btn" data-id="${patient.id}">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-small btn-delete delete-patient-btn" data-id="${patient.id}">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
    
    // Ajouter les événements
    container.querySelectorAll('.view-patient-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const patientId = this.getAttribute('data-id');
            showPatientPage(patientId);
        });
    });
    
    container.querySelectorAll('.edit-patient-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const patientId = this.getAttribute('data-id');
            openEditPatientModal(patientId);
        });
    });
    
    container.querySelectorAll('.delete-patient-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const patientId = this.getAttribute('data-id');
            if (confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
                window.storage.deletePatient(patientId);
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof displayRecentPatients === 'function') displayRecentPatients();
                displayAllPatients();
                alert('Patient supprimé avec succès.');
            }
        });
    });
}

// Afficher les patients récents
function displayRecentPatients() {
    if (!window.storage) return;
    
    const container = document.getElementById('recentPatientsContainer');
    const patients = window.storage.getPatients();
    
    if (patients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-plus"></i>
                <h3>Aucun patient enregistré</h3>
                <p>Commencez par ajouter votre premier patient en cliquant sur le bouton "Ajouter un patient".</p>
            </div>
        `;
        return;
    }
    
    const recentPatients = [...patients]
        .sort((a, b) => new Date(b.dateAjout) - new Date(a.dateAjout))
        .slice(0, 5);
    
    let html = `
        <table class="patients-table">
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>CIN/Passeport</th>
                    <th>Date d'inscription</th>
                    <th>Téléphone</th>
                    <th>Prochain RDV</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    recentPatients.forEach(patient => {
        const patientAppointments = window.storage.getAppointmentsByPatient(patient.id);
        let nextAppointment = 'Aucun';
        
        if (patientAppointments.length > 0) {
            const futureAppointments = patientAppointments
                .filter(a => new Date(a.date) >= new Date() && a.status === 'Confirmé')
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (futureAppointments.length > 0) {
                nextAppointment = formatShortDate(futureAppointments[0].date) + ' ' + futureAppointments[0].time;
            }
        }
        
        html += `
            <tr>
                <td>
                    <div class="patient-name">${patient.prenom} ${patient.nom}</div>
                    <div class="patient-id">ID: ${formatPatientIdForDisplay(patient.id)}</div>
                </td>
                <td>${patient.cinPasseport || 'N/A'}</td>
                <td>${formatShortDate(patient.dateAjout)}</td>
                <td>${patient.telephone}</td>
                <td>${nextAppointment}</td>
                <td>
                    <span class="status-badge status-${patient.statut ? patient.statut.toLowerCase() : 'active'}">${patient.statut || 'Actif'}</span>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        <div style="text-align: center; margin-top: 20px;">
            <button class="btn btn-secondary" id="viewMorePatientsBtn">
                <i class="fas fa-eye"></i> Voir tous les patients (${patients.length})
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    if (document.getElementById('viewMorePatientsBtn')) {
        document.getElementById('viewMorePatientsBtn').addEventListener('click', function() {
            if (typeof showPatientsList === 'function') showPatientsList();
        });
    }
}