import { test } from "node:test";
import assert from "node:assert/strict";
import { handleResearch } from "./research";
const request = (body: unknown, origin = "http://127.0.0.1:3100") => new Request("http://127.0.0.1:3100/api/research", {method:"POST",headers:{origin},body:JSON.stringify(body)});
test("research rejects foreign origins, invalid queries and missing keys",async()=>{
 assert.equal((await handleResearch(request({query:"health"},"https://other.example"),"")).status,403);
 assert.equal((await handleResearch(request({query:"x"}),"")).status,400);
 assert.equal((await handleResearch(request({query:"health"}),"")).status,503);
});
test("research restricts governance sources, filters unsafe links and keeps provenance",async()=>{
 const fake: typeof fetch = async (_url,init)=>{const body=JSON.parse(String(init?.body));assert.deepEqual(body.includeDomains,["un.org","unesco.org","who.int"]);assert.equal(body.numResults,5);return Response.json({results:[{title:"Report",url:"https://who.int/report",publishedDate:"2026-01-01",highlights:["Public evidence"]},{url:"javascript:alert(1)"}]});};
 const r=await handleResearch(request({query:"AI governance",scope:"governance"}),"fixture",fake);const b=await r.json();assert.equal(b.results.length,1);assert.equal(b.results[0].excerpt,"Public evidence");assert.equal(b.untrusted,true);
});
test("provider failures never expose upstream secrets",async()=>{
 const fake: typeof fetch=async()=>{throw new Error("secret-fixture")};
 const r=await handleResearch(request({query:"health"}),"fixture",fake);assert.equal(r.status,502);assert.ok(!(await r.text()).includes("secret-fixture"));
});
