import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Help() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <Button
          onClick={() => setIsSidebarOpen(true)}
          className="bg-primary text-white p-3 rounded-full shadow-lg flex items-center justify-center h-12 w-12"
        >
          <span className="material-icons">menu</span>
        </Button>
      </div>
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-10">
        <TopBar 
          toggleSidebar={() => setIsSidebarOpen(true)}
          onSearch={() => {}}
          onAddBatch={() => {}}
        />
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Hjälp & Instruktioner</h1>
          
          <div className="grid gap-6">
            {/* Översikt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Översikt</CardTitle>
                <CardDescription>
                  Grundläggande information om inventeringssystemet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Detta system är utformat för att hjälpa dig att hantera och inventera batches på ett effektivt sätt.
                  Du kan övervaka inventering, markera batches som inventerade, importera och exportera data.
                </p>
              </CardContent>
            </Card>
            
            {/* Vanliga frågor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Vanliga frågor</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="q1">
                    <AccordionTrigger>Hur lägger jag till en batch manuellt?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">För att lägga till en batch manuellt:</p>
                      <ol className="list-decimal pl-5 mb-4 space-y-1">
                        <li>Klicka på "+" knappen i det övre högra hörnet</li>
                        <li>Fyll i batchens information i formuläret</li>
                        <li>Om batchen redan är inventerad, markera kryssrutan "Redan inventerad"</li>
                        <li>Klicka på "Spara" för att lägga till batchen</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="q2">
                    <AccordionTrigger>Hur markerar jag en batch som inventerad?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">För att markera en batch som inventerad:</p>
                      <ol className="list-decimal pl-5 mb-4 space-y-1">
                        <li>Hitta batchen i tabellen</li>
                        <li>Klicka på "Inventerat" knappen</li>
                        <li>Batchen markeras automatiskt som helt inventerad</li>
                      </ol>
                      <p>Om du bara vill markera en del av batchen som inventerad:</p>
                      <ol className="list-decimal pl-5 mb-2 space-y-1">
                        <li>Klicka på "Inventerat del" knappen</li>
                        <li>Ange vikt och lagerplats i dialogrutan</li>
                        <li>Klicka på "Spara" för att markera delen som inventerad</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="q3">
                    <AccordionTrigger>Hur importerar jag batchdata från Excel?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">För att importera batchdata från Excel:</p>
                      <ol className="list-decimal pl-5 mb-4 space-y-1">
                        <li>Gå till "Import" sidan via sidomenyn</li>
                        <li>Klicka på "Välj fil" eller dra och släpp din Excel-fil i det markerade området</li>
                        <li>Välj om du vill skriva över befintliga batches med samma batchnummer</li>
                        <li>Klicka på "Importera" för att slutföra importen</li>
                      </ol>
                      <p>OBS: Excel-filen bör ha följande kolumner: artikelnummer, benämning, batchnummer, totalt saldo, lagerplats</p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="q4">
                    <AccordionTrigger>Hur exporterar jag inventeringsdata till Excel?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">För att exportera inventeringsdata till Excel:</p>
                      <ol className="list-decimal pl-5 mb-4 space-y-1">
                        <li>Gå till "Export" sidan via sidomenyn</li>
                        <li>Välj vilken typ av export du vill göra (standard, detaljerad eller sammanfattning)</li>
                        <li>Klicka på "Exportera" knappen</li>
                        <li>En Excel-fil laddas ner automatiskt till din dator</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="q5">
                    <AccordionTrigger>Hur ångrar jag en inventering?</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Om du behöver ångra en inventering:</p>
                      <ol className="list-decimal pl-5 mb-4 space-y-1">
                        <li>Hitta batchen i tabellen</li>
                        <li>Klicka på "Ångra" knappen i åtgärdskolumnen</li>
                        <li>Bekräfta åtgärden om det behövs</li>
                        <li>Batchens status återställs till "Ej påbörjad"</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            {/* Förklaringar av statuskoder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Förklaringar av status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                    <div>
                      <h3 className="font-semibold">Ej påbörjad</h3>
                      <p className="text-gray-700">En batch som ännu inte har inventerats.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                    <div>
                      <h3 className="font-semibold">Delvis inventerad</h3>
                      <p className="text-gray-700">En batch där endast en del av den totala vikten har inventerats.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                    <div>
                      <h3 className="font-semibold">Inventerad</h3>
                      <p className="text-gray-700">En batch som har inventerats fullständigt.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tips och tricks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tips och tricks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 list-disc pl-5">
                  <li>Använd sökfunktionen i övre delen av sidan för att snabbt hitta specifika batches.</li>
                  <li>Filtrera batches efter status för att fokusera på de som behöver åtgärdas.</li>
                  <li>Om du arbetar med stora Excel-filer, kontrollera att formaten är korrekta innan import.</li>
                  <li>Exportera data regelbundet som backup och för rapportering.</li>
                  <li>Vid delvis inventering, var noga med att ange korrekt vikt och lagerplats.</li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Kontakt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Kontakt för support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Om du har problem eller frågor om systemet, kontakta systemadministratören:
                </p>
                <div className="mt-4 p-4 bg-gray-100 rounded-md flex flex-col space-y-2">
                  <div className="flex items-center">
                    <span className="material-icons mr-2 text-gray-600">email</span>
                    <span>support@example.com</span>
                  </div>
                  <div className="flex items-center">
                    <span className="material-icons mr-2 text-gray-600">phone</span>
                    <span>+46 123 456 78</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}